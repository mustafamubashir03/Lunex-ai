"use client";

import { useState } from "react";
import {
  Bot, Plus, Search, MoreHorizontal,
  Trash2, Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateThreadMutation, useUpdateThreadMutation, useDeleteThreadMutation } from "@/hooks/threads";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import UserInfo from "../UserInfo/UserInfo";
import { Thread, useThreadsStore } from "@/stores/threadStore";
import { useParams, useRouter } from "next/navigation";
import { ModeToggle } from "../mode-toggle";


const ThreadSkeleton = () => (
  <div className="flex items-center gap-2 px-3 py-2 animate-pulse">
    <div className="h-3.5 w-3.5 bg-muted rounded" />
    <div className="h-3 w-28 bg-muted rounded" />
  </div>
);


const ChatSidebar = ({
  onSelectChat,
  onDeleteChat,
}: any) => {



  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || "";
  const { redirectThreadId } = useParams()
  const { createThreadMutation } = useCreateThreadMutation({ userId })
  const { updateThreadMutation } = useUpdateThreadMutation({ userId })
  const { deleteThreadMutation } = useDeleteThreadMutation({ userId })
  const { threads, isError, isLoading, isPending } = useThreadsStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [threadToRename, setThreadToRename] = useState<{ id: string, title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const onNewChat = async () => {
    await createThreadMutation()
    await queryClient.invalidateQueries({ queryKey: ["threads_by_userId", userId] })
  }

  const handleRenameClick = (threadId: string, currentTitle: string) => {
    setThreadToRename({ id: threadId, title: currentTitle });
    setNewTitle(currentTitle);
    setIsRenameOpen(true);
  }

  const onRenameChat = async () => {
    if (threadToRename && newTitle.trim() && newTitle !== threadToRename.title) {
      await updateThreadMutation({ threadId: threadToRename.id, title: newTitle });
      await queryClient.invalidateQueries({ queryKey: ["threads_by_userId", userId] });
      setIsRenameOpen(false);
      setThreadToRename(null);
    }
  }

  const onDeleteChatLocal = async (threadId: string) => {
    if (window.confirm("Are you sure you want to delete this thread?")) {
      await deleteThreadMutation({ threadId });
      await queryClient.invalidateQueries({ queryKey: ["threads_by_userId", userId] });
      if (redirectThreadId === threadId) {
        router.push("/chat");
      }
    }
  }



  const handleSelect = (id: string) => {
    router.push(`/chat/${id}`)
  };

  return (
    <aside className="flex h-full w-full flex-col bg-muted border-r border-border">

      <div className="flex flex-col gap-4 px-4 pt-5 pb-3">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>

            <span className="text-base font-semibold text-foreground tracking-tight">
              Lunex<span className="text-muted-foreground">.AI</span>
            </span>
          </div>
          
          <ModeToggle />
        </div>

        {/* PRIMARY CTA */}
        <Button
          onClick={onNewChat}
          className="
      w-full h-10 rounded-xl
      text-primary-foreground
      bg-linear-to-t from-primary to-chart-2
      font-medium
      shadow-sm
      cursor-pointer
      hover:opacity-90
      transition-all
    "
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-input px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value=""
            onChange={(e) => { }}
            placeholder="Search threads…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <Separator />

      {/* Threads */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2">

        {/* Loading */}
        {(isPending || isLoading || !userId) &&
          Array.from({ length: 6 }).map((_, i) => (
            <ThreadSkeleton key={i} />
          ))}

        {/* Error */}
        {isError && (
          <div className="text-sm text-destructive px-3 py-4">
            Failed to load threads.
          </div>
        )}

        {/* Empty */}
        {!isPending && !isError && !!userId && threads?.length === 0 && (
          <div className="text-sm text-muted-foreground px-3 py-4">
            No threads found.
          </div>
        )}

        {/* Threads List */}
        {!isPending && !isError && threads?.map((thread: Thread) => {

          const isActive = thread.threadId === redirectThreadId;

          return (
            <div
              key={thread.threadId}
              onClick={() => handleSelect(thread?.threadId)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors
                ${redirectThreadId === thread.threadId
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent"
                }`}
            >
              {/* indicator */}
              <div
                className={`h-2 w-2 rounded-full ${isActive ? "bg-accent-foreground" : "bg-primary"
                  }`}
              />

              <span className="flex-1 truncate text-sm font-medium">
                {thread.title}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`opacity-0 group-hover:opacity-100 transition ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuItem 
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameClick(thread.threadId, thread.title);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChatLocal(thread.threadId);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </nav>

      <Separator />

      {/* User */}
      <UserInfo />

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Thread</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Title
              </Label>
              <Input
                id="name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRenameChat();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onRenameChat} disabled={!newTitle.trim() || newTitle === threadToRename?.title}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default ChatSidebar;