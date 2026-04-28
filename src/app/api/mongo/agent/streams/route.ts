import { cerebrasModel, fireworksModel } from "@/llms/LLM";
import { writeToMongoChatHistoryTool } from "@/tools/mongoChatHistoryTool";
import { createAgent } from "langchain";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { userId, threadId, content } = await req.json();

        const agent = createAgent({
            model: cerebrasModel,
            systemPrompt: `You are a helpful assistant that chats professionally.
      Always remember past conversation context.`,
        });

        const encoder = new TextEncoder();

        const sse = (event: string, data: any) => {
            return encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            );
        };

        // ✅ Save user message first using Mongo Tool
        await writeToMongoChatHistoryTool.invoke({
            messages: [{ userId, threadId, content, role: "user" }],
        });

        let streamingText = "";
        let thinkingBuffer = "";
        let isClosed = false;

        const stream = new ReadableStream({
            async start(controller) {
                // ✅ Add Abort Handling
                const abort = req.signal;

                // ✅ Add Heartbeat (Safe universal keep-alive)
                const heartbeat = setInterval(() => {
                    if (!isClosed) {
                        controller.enqueue(encoder.encode(":\n\n"));
                    }
                }, 15000);

                abort?.addEventListener("abort", () => {
                    isClosed = true;
                    clearInterval(heartbeat);
                    try { controller.close(); } catch (e) { }
                });

                try {
                    // ✅ Send Initial Chunk
                    controller.enqueue(sse("start", { ok: true }));
                    await Promise.resolve();

                    // ✅ Use "messages" mode for true token-by-token streaming
                    const agentStream = await agent.stream(
                        {
                            messages: [{ role: "user", content }],
                        },
                        {
                            streamMode: "messages",
                        }
                    );

                    for await (const [message, metadata] of agentStream) {
                        if (isClosed) break;

                        // Identify the node
                        const node = metadata?.langgraph_node;

                        // Extract content and reasoning tokens
                        const delta = message.content;
                        const blocks = message.additional_kwargs?.contentBlocks ?? [];

                        // Handle Reasoning (Thinking) Tokens
                        const reasoning = blocks.filter((b: any) => b.type === "reasoning")?.[0]?.reasoning;
                        if (reasoning) {
                            thinkingBuffer += reasoning;
                            controller.enqueue(sse("thinking", { thinking: reasoning }));
                            await Promise.resolve();
                        }

                        // Handle Content Tokens
                        if (delta) {
                            streamingText += delta;
                            controller.enqueue(sse("message", { content: delta }));
                            await Promise.resolve();
                        }
                    }

                    // ✅ Send "end" ONLY once
                    if (!isClosed) {
                        controller.enqueue(sse("end", { ok: true }));
                    }

                    clearInterval(heartbeat);

                    // ✅ SAVE AI RESPONSE using Mongo Tool
                    if (!isClosed) {
                        await writeToMongoChatHistoryTool.invoke({
                            messages: [
                                {
                                    role: "ai",
                                    thinking: thinkingBuffer.trim(),
                                    content: streamingText,
                                    threadId,
                                    userId,
                                },
                            ],
                        });
                    }

                    if (!isClosed) controller.close();
                } catch (error: any) {
                    clearInterval(heartbeat);
                    if (!isClosed) {
                        controller.enqueue(
                            sse("error", { message: error.message })
                        );
                        controller.close();
                    }
                }
            },
        });

        // ✅ Fix SSE Response Headers
        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "Content-Encoding": "none",
            },
        });

    } catch (error: any) {
        return new Response(
            JSON.stringify({ ok: false, error: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};
