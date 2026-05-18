import { Document } from "@langchain/core/documents";
import { CohereEmbeddings } from "@langchain/cohere";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone"
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone"
import { v4 as uuidv4 } from "uuid"
import { ContextualCompressionRetriever } from "@langchain/classic/retrievers/contextual_compression"
import { LLMChainExtractor } from "@langchain/classic/retrievers/document_compressors/chain_extract"
import { ChatCerebras } from "@langchain/cerebras";




async function loadRawDocs(allDocs: Document[]) {
    return allDocs.flat()
}

async function createParentDocs({ rawDocs, userId }: { rawDocs: Document[], userId: string }) {

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 400 })
    const parentSplit = await splitter.splitDocuments(rawDocs)
    return parentSplit.map((split) => {
        const chunkId = uuidv4()
        split.metadata.docType = "parent"
        split.metadata.chunkId = chunkId
        split.metadata.parentId = chunkId
        split.metadata.source = chunkId
        split.metadata.userId = userId
        return split
    })
}

async function createChildDocs({ parentDocs, userId }: { parentDocs: Document[], userId: string }) {
    const childSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 400, chunkOverlap: 100 })
    const childSplits = await childSplitter.splitDocuments(parentDocs)

    return childSplits.map((split) => {

        const parentId = split.metadata.parentId;
        const source = split.metadata.source;

        split.metadata.docType = "child";
        split.metadata.chunkId = `child-${parentId}-${uuidv4()}`;
        split.metadata.userId = userId;
        split.metadata.parentId = parentId;
        split.metadata.source = source;

        return split;
    });
}

const sharedEmbeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0",
    maxRetries: 10,
    batchSize: 32
})

const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY || "" })
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX || "")
const vectorStore = new PineconeStore(sharedEmbeddings, {
    pineconeIndex,
    maxConcurrency: 2
})

export async function docEmbeddingMultiVector({ allDocs, userId }: { allDocs: Document[], userId: string }) {
    console.log("loading documents")
    const rawDocs = await loadRawDocs(allDocs)
    console.log("creating parent docs")
    const parentDocs = await createParentDocs({ rawDocs, userId })
    console.log("creating child docs")
    const childDocs = await createChildDocs({ parentDocs, userId })
    console.log(`Saving ${parentDocs.length} parents and ${childDocs.length} children...`)
    await vectorStore.addDocuments([...parentDocs, ...childDocs])
    console.log("[LTM STORAGE] Pinecone indexing successful.");

    console.log("Memory storage complete.")
}

export async function queryMultiVector({ userId, query }: { userId: string, query: string }) {
    const kParents = 5; // Retrieve more parents for better context
    console.log(`Searching LTM for user ${userId} with query: "${query}"`);
    
    // Increase child search to 15 for better coverage of small fragments
    const childDocs = await vectorStore.similaritySearch(query, 15, { 
        docType: "child", 
        userId: userId 
    });
    
    console.log(`Found ${childDocs.length} child chunks.`);
    
    if (childDocs.length === 0) {
        return { query, retrievedDocs: [] };
    }

    const parentChunkIds = [...new Set(childDocs.map((doc) => doc?.metadata?.parentId))] as string[];
    console.log(`Mapped to ${parentChunkIds.length} unique parent IDs:`, parentChunkIds);

    const compressor = LLMChainExtractor.fromLLM(new ChatCerebras({
        model: "llama3.1-8b",
        temperature: 0,
        apiKey: process.env.CEREBRAS_API_KEY
    }))
    
    const retriever = new ContextualCompressionRetriever({
        baseRetriever: vectorStore.asRetriever({
            k: kParents,
            filter: {
                docType: "parent",
                userId: userId, // Ensure we only get this user's parents
                chunkId: { $in: parentChunkIds }
            }
        }),
        baseCompressor: compressor
    })

    const retrievedDocs = await retriever.invoke(query);
    console.log(`Retrieved ${retrievedDocs.length} compressed documents from LTM.`);
    return { query, retrievedDocs }
}
