"use client"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { useEffect, useState } from "react";

type UserType = { id: string; createdAt: Date; updatedAt: Date; email: string; emailVerified: boolean; name: string; image?: string | null | undefined; } | null

export const useGetCurrentUser = ()=>{
    const [currentUser, setCurrentUser] = useState<UserType>(null)
    const getSession = async()=>{
        const session = await auth.api.getSession({
            headers: await headers()
          });
        if(session){
            setCurrentUser(session?.user)
        }
    }
    useEffect(()=>{
        getSession()
    },[])

    return({
        currentUser
    })

}