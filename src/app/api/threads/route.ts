import { createThreadHistoryTool, updateThreadTool,readThreadTool,getAllThreadsByUserId } from "@/tools/threadTool";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    try{
        const body = await req.json()
        const {userId,threadId} = body
        if(!userId){
            return NextResponse.json({error:"userId is required"},{status:400})
        }
        const result = await createThreadHistoryTool.invoke({threadId,userId})
        return NextResponse.json(JSON.parse(result))
    }catch(error){
        console.error("Create thread api error",error)
        return NextResponse.json({error:"Failed to create thread via api"},{status:500});
        }
}

export async function GET(req:NextRequest){
    try{
       const {searchParams} =new URL(req.url)
       const userId = searchParams.get("userId")
       if(!userId){
         return NextResponse.json({error:"userId is required"},{status:400})
       }
       const result = await getAllThreadsByUserId.invoke({userId})
       const parsed = typeof result === "string"
  ? JSON.parse(result)
  : result;

return NextResponse.json({
  threads: parsed?.threads ?? [],
  redirectThreadId: parsed?.redirectThreadId ?? null,
});

    }catch(error){
        console.error("Failed to get all threads via api",error)
        return NextResponse.json({error:"Failed to get all threads by id via api"},{status:500})
    }
}

export async function PATCH(req:NextRequest){
    try{
        const body = await req.json()
        const {threadId,userId,title} = body
        if(!userId || !threadId || !title){
          return NextResponse.json({error:"userId, threadId and title are required"},{status:400})
        }
        const updatedThread = await updateThreadTool.invoke({threadId,userId,title})
        return NextResponse.json(updatedThread)
 
     }catch(error){
         console.error("Failed to update thread via api",error)
         return NextResponse.json({error:"Failed to update thread by id via api"},{status:500})
     }
}