import { createAgent, summarizationMiddleware } from "langchain";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { getUserInfo, greet, updateUserInfo, writeMemory, searchLongTermMemory, readThreadHistory } from "@/tools/memoryTool";
import { MEMORY_AGENT_SYSTEM_PROMPT } from "@/memo/prompt/system-prompt";




import { client } from "@/lib/mongodb/client";
import { AgentState } from "@/lib/agent/state";
const checkpointer = new MongoDBSaver({
    client: client as any,
    dbName: client.db().databaseName
});

export const createMemoryAgent = ({ model, tools = [] }: { model: any, tools?: any[] }) => {
    return createAgent({
        model,
        tools: [...(tools || []), getUserInfo, updateUserInfo, greet, writeMemory, searchLongTermMemory, readThreadHistory] as any,
        instructions: MEMORY_AGENT_SYSTEM_PROMPT,
        stateSchema: AgentState,
        middleware: [
            summarizationMiddleware({
                model,
                trigger: { tokens: 3000 },
                keep: { messages: 20 },
            }),
        ],
        checkpointer: checkpointer as any,
    } as any);
};

