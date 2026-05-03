import { ChatCerebras } from "@langchain/cerebras";
import { tool } from "@langchain/core/tools";
import { SystemMessage, HumanMessage } from "langchain";
import z from "zod";
import dotenv from "dotenv"
dotenv.config()

const summarizationModel = new ChatCerebras({
    model: "llama3.1-8b",
    temperature: 0.3,
    apiKey: process.env.CEREBRAS_API_KEY
})


const SYSTEM_PROMPT = `
You are a Memory Compression Agent.

Your task is to compress a full daily chat log into a clean, durable summary optimized for long-term memory storage.

Rules:
- Remove all internal reasoning traces (e.g., think blocks, hidden chains of thought).
- Ignore system prompts, tool calls, and assistant planning text.
- Remove timestamps, metadata, and formatting noise.
- Do NOT rewrite the conversation as dialogue.
- Do NOT add, infer, or hallucinate any new information.
- Preserve stable, important user facts and context.
- Focus only on meaningful, relevant content.
- Keep the summary concise (150–250 words maximum).

Output format (STRICT — follow exactly):

Daily Log Summary:
Date: {date}
Status: Compressed

Overview:
{1–2 sentence high-level description}

Key facts extracted:
- {Fact 1}
- {Fact 2}
- {Fact 3}

Conversation Summary:
{Short narrative summary of meaningful events}
`


export const compressSTMTool = tool(async ({ messages }: { messages: string }) => {
    const res = await summarizationModel.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(messages)
    ])
    return res?.content

}, {
    name: "compressSTMTool",
    description: "Compresses STM memory",
    schema: z.object({
        messages: z.string().describe("Raw text or concatinated messages to be compressed")
    })
})