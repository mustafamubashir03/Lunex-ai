import { getAllMongoThreadsByUserId as getAllThreadsByUserId } from "@/tools/mongoThreadTool";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * This page handles the generic "/chat" route.
 * It identifies the user's active thread and redirects to it directly.
 * By doing this here, we avoid an extra redirect to "/" and then back to "/chat/[id]".
 */
export default async function ChatRootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  // Fetch or create the latest thread for the user
  const result = await getAllThreadsByUserId.invoke({
    userId: session.user.id,
  });

  let redirectThreadId: string | null = null;

  // Handle results from the tool
  if (result && typeof result === "object" && "redirectThreadId" in result) {
    redirectThreadId = (result as any).redirectThreadId;
  } else if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result);
      redirectThreadId = parsed?.redirectThreadId ?? null;
    } catch {
      redirectThreadId = null;
    }
  }

  // Redirect to the specific thread
  if (redirectThreadId && redirectThreadId.trim() !== "") {
    return redirect(`/chat/${redirectThreadId}`);
  }

  // Final fallback
  return redirect("/chat/new-thread-session");
}
