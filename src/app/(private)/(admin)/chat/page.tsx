import Chatpanel from "@/components/chat/Chatpanel";
import ChatSidebar from "@/components/chat/ChatSidebar";
import Logout from "@/components/Logout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation"; // Added for safety

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Even though 'proxy.ts' handles this, a server-side 
  // check here prevents "flash of unauthenticated content"
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - Fixed width */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <ChatSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted/20">

        {/* Chat Panel - This should take up the remaining height */}
        <div className="flex-1 overflow-hidden p-4 md:p-6">
          <Chatpanel />
        </div>
      </main>
    </div>
  );
}

export default Page;