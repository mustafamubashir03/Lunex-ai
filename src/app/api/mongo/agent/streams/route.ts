import { cerebrasModel } from "@/llms/LLM";
import { writeToMongoChatHistoryTool } from "@/tools/mongoChatHistoryTool";
import { createMemoryAgent } from "@/lib/agent/memoryAgent";
import { MemoryService } from "@/services/memoryService";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const { userId, threadId, content } = await req.json();


        const agent = createMemoryAgent({
            model: cerebrasModel,
            tools: [], // Add other tools here as needed
        });

        const encoder = new TextEncoder();

        const sse = (event: string, data: any) => {
            return encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            );
        };


        await writeToMongoChatHistoryTool.invoke({
            messages: [{ userId, threadId, content, role: "user" }],
        });

        let streamingText = "";
        let thinkingBuffer = "";
        let isClosed = false;

        const stream = new ReadableStream({
            async start(controller) {
                const abort = req.signal;

                // Heartbeat to keep connection alive
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
                    controller.enqueue(sse("start", { ok: true }));
                    await Promise.resolve();

                    const agentStream = await agent.stream(
                        {
                            messages: [{ role: "user", content }],
                            userId, // Pass userId to populate the state
                        },
                        {
                            configurable: { thread_id: threadId },
                            streamMode: "messages",
                        }
                    );

                    for await (const chunk of agentStream) {
                        if (isClosed) break;

                        // In "messages" stream mode, each chunk is a [message, metadata] tuple
                        const [message, metadata] = Array.isArray(chunk) ? chunk : [chunk, (chunk as any).metadata];
                        
                        // Handle tool status indications
                        if (metadata?.langgraph_node === "tools") {
                            const toolName = (message as any).name;
                            if (toolName === "write_memory") {
                                controller.enqueue(sse("status", { message: "Saving to long-term memory..." }));
                            } else if (toolName === "search_long_term_memory") {
                                controller.enqueue(sse("status", { message: "Searching past memories..." }));
                            }
                            continue;
                        }

                        if (!message || metadata?.langgraph_node !== "model_request") continue;

                        const delta = typeof message.content === "string" ? message.content : "";
                        const blocks = (message.additional_kwargs?.contentBlocks as any[]) ?? [];

                        const reasoning = blocks.filter((b: any) => b.type === "reasoning")?.[0]?.reasoning;
                        if (reasoning) {
                            thinkingBuffer += reasoning;
                            controller.enqueue(sse("thinking", { thinking: reasoning }));
                        }

                        if (delta) {
                            streamingText += delta;
                            controller.enqueue(sse("message", { content: delta }));
                        }
                    }

                    if (!isClosed) {
                        controller.enqueue(sse("end", { ok: true }));
                    }

                    clearInterval(heartbeat);

                    // 1. STM Stage: Save AI response (Blocking)
                    if (!isClosed && (streamingText.trim() || thinkingBuffer.trim())) {
                        await writeToMongoChatHistoryTool.invoke({
                            messages: [
                                {
                                    role: "ai",
                                    thinking: thinkingBuffer.trim(),
                                    content: streamingText.trim() || "...", // Fallback for required field
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
                        controller.enqueue(sse("error", { message: error.message }));
                        controller.close();
                    }
                }
            },
        });

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
