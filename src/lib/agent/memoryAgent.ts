import { createAgent, summarizationMiddleware } from "langchain";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { client } from "@/lib/mongodb/client";
import { writeLTM, searchLTM, readHistory } from "@/tools/memoryTool";
import { MEMORY_AGENT_SYSTEM_PROMPT } from "@/memo/prompt/system-prompt";
import { AgentState } from "@/lib/agent/state";

const checkpointer = new MongoDBSaver({
    client: client as any,
    dbName: "test",
});

export const createMemoryAgent = ({ model, tools = [] }: { model: any, tools?: any[] }) => {
    return createAgent({
        model,
        tools: [...(tools || []), writeLTM, searchLTM, readHistory] as any,
        systemPrompt: MEMORY_AGENT_SYSTEM_PROMPT,
        stateSchema: AgentState,
        middleware: [
            summarizationMiddleware({
                model,
            }),
        ],
        checkpointer: checkpointer,
    });
};
