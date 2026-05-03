import { BM25Retriever } from "@langchain/community/retrievers/bm25";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

const convertDocToString = (docs: Document[]) => {
    return docs.map((doc) => doc?.pageContent).join("\n\n")
}


export const bm25Retriever = async ({ doc, query }: { doc: string, query: string }) => {
    const newDoc = new Document({
        pageContent: doc,
        metadata: {
            title: "user : " + "DAILY_LOG_ARCHIVE"
        }
    })
    const docSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    })
    const docSplit = await docSplitter.splitDocuments([newDoc])
    const retriever = BM25Retriever.fromDocuments([...docSplit], { k: 4 })
    const data = await retriever.invoke(query)
    return convertDocToString(data)
}