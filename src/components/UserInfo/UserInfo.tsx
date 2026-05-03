"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

const UserInfo = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login")
  };

  if (isPending) {
    return (
      <div className="flex w-full items-center gap-3 px-3 py-3 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-2.5 w-28 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <Dialog>
      {/* CLICKABLE USER ROW */}
      <DialogTrigger asChild>
        <button className="flex w-full cursor-pointer items-center gap-3 px-3 py-3 hover:bg-accent transition-colors text-left outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-muted text-foreground">
              {session?.user?.name?.slice(0, 2)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {session?.user?.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {session?.user?.email}
            </span>
          </div>
        </button>
      </DialogTrigger>

      {/* MODAL */}
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>

        {/* USER INFO */}
        <div className="flex items-center gap-3 py-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-muted text-foreground">
              {session?.user?.name?.slice(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {session?.user?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {session?.user?.email}
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 mt-2">
          <Button variant="secondary" className="w-full justify-start">
            Settings
          </Button>

          <Button variant="secondary" className="w-full justify-start">
            Billing
          </Button>

          <Button
            variant="destructive"
            className="w-full cursor-pointer justify-start bg-red-700/50 text-red-400"
            onClick={handleLogout}
          >
            <LogOutIcon />
            Logout
          </Button>
        </div>

        {/* FOOTER */}
        <DialogFooter className="mt-2">
          <span className="text-xs text-muted-foreground">
            Manage your account preferences
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserInfo;