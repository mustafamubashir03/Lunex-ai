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
    return childSplits.map((split, i) => {
        const parentIndex = Math.floor(i / 4)
        const parentMetadata = parentDocs[parentIndex]?.metadata
        split.metadata.docType = "child"
        split.metadata.chunkId = `child-${parentMetadata?.chunkId}-${i}`
        split.metadata.parentId = parentMetadata?.chunkId
        split.metadata.source = parentMetadata.metadata.source as string
        split.metadata.userId = userId
        return split

    })
}


export async function docEmbeddingMultiVector({ allDocs, userId }: { allDocs: Document[], userId: string }) {
    const embeddings = new CohereEmbeddings({ apiKey: process.env.COHERE_API_KEY, model: "embed-english-v3.0" })
    const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY || "" })
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX || "")
    console.log("loading documents")
    const rawDocs = await loadRawDocs(allDocs)
    console.log("creating parent docs")
    const parentDocs = await createParentDocs({ rawDocs, userId })
    console.log("creating child docs")
    const childDocs = await createChildDocs({ parentDocs, userId })
    const vectorStore = new PineconeStore(embeddings, {
        pineconeIndex,
        maxConcurrency: 5
    })
    await vectorStore.addDocuments(childDocs)
    console.log("single index", parentDocs.length, "parent chunk size")
    console.log("total documents", parentDocs.length + childDocs.length)
}

export async function queryMulitVector({ userId, query }: { userId: string, query: string }) {
    const kParents = 3
    const embeddings = new CohereEmbeddings({ apiKey: process.env.COHERE_API_KEY, model: "embed-english-v3.0" })
    const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY || "" })
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX || "")
    const vectorStore = new PineconeStore(embeddings, {
        pineconeIndex,
        maxConcurrency: 5
    })
    const childDocs = await vectorStore.similaritySearch(query, 6, { docType: "child", userId: userId })
    const parentChunkIds = [...new Set(childDocs.map((doc) => doc?.metadata?.parentId))] as string[]
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
                source: { $in: parentChunkIds }
            }
        }),
        baseCompressor: compressor
    })
    const retrievedDocs = await retriever.invoke(query)
    return { query, retrievedDocs }
}