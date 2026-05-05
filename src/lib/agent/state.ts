import { StateSchema } from "@langchain/langgraph";
import * as z from "zod";

export const AgentState = new StateSchema({
    userId: z.string().optional(),
    userName: z.string().optional(),
    memories: z.array(z.string()).default([]),
});
