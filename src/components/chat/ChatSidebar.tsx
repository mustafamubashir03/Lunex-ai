"use client";

import { useState } from "react";
import {
  Bot, Plus, Search, MoreHorizontal,
  Globe, Code2, FileSearch, BrainCircuit,
  Trash2, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type TaskType = "browse" | "code" | "research" | "reason";

export interface Chat {
  id: string;
  title: string;
  type: TaskType;
  updatedAt: string;
}

export interface SidebarUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const ROUGH_CHATS: Chat[] = [
  { id: "1", title: "Scrape YC W25 batch founders list", type: "browse", updatedAt: new Date().toISOString() },
  { id: "2", title: "Fix auth bug in Next.js middleware", type: "code", updatedAt: new Date().toISOString() },
  { id: "3", title: "Research on LLM memory techniques", type: "research", updatedAt: new Date().toISOString() },
  { id: "4", title: "Summarise Stripe API docs", type: "research", updatedAt: new Date(Date.now() - 86400000).toISOString() },
];

const ROUGH_USER: SidebarUser = {
  name: "Ahsan Khan",
  email: "ahsan@lunex.ai",
  avatarUrl: "https://github.com/shadcn.png",
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const TYPE_ICON: Record<TaskType, React.ElementType> = {
  browse: Globe,
  code: Code2,
  research: FileSearch,
  reason: BrainCircuit,
};

function groupChats(chats: Chat[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yest = today - 86400000;
  const week = today - 6 * 86400000;

  const groups: Record<string, Chat[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    Older: [],
  };

  chats.forEach((c) => {
    const t = new Date(c.updatedAt).getTime();
    if (t >= today) groups["Today"].push(c);
    else if (t >= yest) groups["Yesterday"].push(c);
    else if (t >= week) groups["Last 7 days"].push(c);
    else groups["Older"].push(c);
  });

  return Object.entries(groups)
    .filter(([, v]) => v.length > 0)
    .map(([label, chats]) => ({ label, chats }));
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const ChatSidebar = ({
  chats = ROUGH_CHATS,
  user = ROUGH_USER,
  activeChatId: externalActiveId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onUserMenuClick,
}: any) => {

  const [internalActiveId, setInternalActiveId] = useState("1");
  const activeId = externalActiveId ?? internalActiveId;

  const [query, setQuery] = useState("");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = query.trim()
    ? chats.filter((c: Chat) =>
        c.title.toLowerCase().includes(query.toLowerCase())
      )
    : chats;

  const grouped = groupChats(filtered);

  const handleSelect = (id: string) => {
    setInternalActiveId(id);
    onSelectChat?.(id);
  };

  const handleNewChat = () => onNewChat?.();

  const handleConfirmRename = (id: string) => {
    if (renameValue.trim()) onRenameChat?.(id, renameValue.trim());
    setRenamingId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteChat?.(id);
    if (activeId === id) setInternalActiveId("");
  };

  return (
    <aside className="flex h-screen w-[260px] flex-col bg-muted border-r">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-zinc-900">
            Lunex<span className="text-zinc-600">.AI</span>
          </span>
        </div>

        <Button onClick={handleNewChat} className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="h-3.5 w-3.5 text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none"
          />
        </div>
      </div>

      <Separator />

      {/* List */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2">

        {grouped.map(({ label, chats }) => (
          <div key={label} className="mb-3">

            <p className="px-2 pb-1 text-[11px] font-medium text-zinc-500 uppercase">
              {label}
            </p>

            {chats.map((chat: Chat) => {
              const Icon = TYPE_ICON[chat.type];
              const isActive = chat.id === activeId;

              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelect(chat.id)}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer ${
                    isActive ? "bg-zinc-200" : "hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-zinc-500" />

                  <span className="flex-1 truncate text-sm text-zinc-900">
                    {chat.title}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setRenamingId(chat.id)}>
                        <Pencil className="h-3.5 w-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(chat.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <Separator />

      {/* User */}
      <div className="flex items-center gap-3 px-3 py-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>
            {user.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-zinc-900">
            {user.name}
          </span>
          <span className="text-xs text-zinc-600">
            {user.email}
          </span>
        </div>
      </div>

    </aside>
  );
};

export default ChatSidebar;