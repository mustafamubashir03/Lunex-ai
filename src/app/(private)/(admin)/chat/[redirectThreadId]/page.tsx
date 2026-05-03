"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Chatpanel from "@/components/chat/Chatpanel";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      
      {/* Mobile Header - Toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-xl shadow-lg border-primary/20 bg-background/80 backdrop-blur-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-r-0">
            <ChatSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <ChatSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted/20 relative">
        <div className="flex-1 overflow-hidden">
          <Chatpanel />
        </div>
      </main>
    </div>
  );
};

export default Page;