import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";



export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
})


  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>Hello world</h1>
      <div>
        <h1>Welcome {session?.user.name}</h1>
    </div>
      <Button>Click me</Button>
        </div>
  );
}
