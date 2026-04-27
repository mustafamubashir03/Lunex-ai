import { getAllThreadsByUserId } from "@/tools/threadTool";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const result = await getAllThreadsByUserId.invoke({
    userId: session.user.id,
  });

  let redirectThreadId: string | null = null;

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

  if (redirectThreadId && redirectThreadId.trim() !== "") {
    return redirect(`/chat/${redirectThreadId}`);
  }

  return redirect("/chat/new-thread");
}