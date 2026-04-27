"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Chatpanel from "@/components/chat/Chatpanel";
import ChatSidebar from "@/components/chat/ChatSidebar";

import { useGetAllThreadsByUserId } from "@/hooks/threads";
import { authClient } from "@/lib/auth-client";
import { useThreadsStore } from "@/stores/threadStore";

const Page = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    data,
    isPending,
    isLoading,
    isError,
  } = useGetAllThreadsByUserId({
    userId: userId || "",
  });

  const {
    setThreads,
    setIsError,
    setIsPending,
    setIsLoading,
  } = useThreadsStore();


  useEffect(() => {
    if (!data) return;

    setThreads(data.threads || []);
  }, [data, setThreads]);

  useEffect(() => {
    setIsError(isError);
    setIsLoading(isLoading);
    setIsPending(isPending);
  }, [isError, isLoading, isPending, setIsError, setIsLoading, setIsPending]);


  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <ChatSidebar />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted/20">
        <div className="flex-1 overflow-hidden p-4 md:p-6">
          <Chatpanel />
        </div>
      </main>
    </div>
  );
};

export default Page;