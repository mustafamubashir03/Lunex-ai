import { BM25Retriever } from "@langchain/community/retrievers/bm25";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

/**
 * BM25 Keyword Search
 * Used as a high-precision fallback for semantic vector search.
 * Ideal for finding exact matches for technical terms, project names, or specific facts.
 */
export const bm25Retriever = async ({ doc, query }: { doc: string, query: string }) => {
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const texts = await splitter.splitText(doc);
    const documents = texts.map(text => new Document({ pageContent: text }));
    
    const retriever = BM25Retriever.fromDocuments(documents, { k: 4 });
    const results = await retriever.invoke(query);
    return results;
};
