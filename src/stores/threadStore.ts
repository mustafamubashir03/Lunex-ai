import { create } from "zustand";

export type Thread = {
    userId: string;
    threadId: string;
    title: string;
    active: boolean;
    createdAt: string;
  };

export type threadsType = {
    threads: Thread[],
    isError:boolean,
    isPending:boolean,
    isLoading:boolean,
    setIsError:(value:boolean)=>void
    setIsPending:(value:boolean)=>void,
    setIsLoading:(value:boolean)=>void,
    setThreads:(threadsData:Thread[])=>void
}

export const useThreadsStore = create<threadsType>((set)=>({
        threads:[],
        isError:false,
        isLoading:false,
        isPending:false,
        setThreads:(threadsData:Thread[])=>set({threads:[...threadsData]}),
        setIsError:(value)=>set({isError:value}),
        setIsPending:(value)=>set({isPending:value}),
        setIsLoading:(value)=>set({isLoading:value})
}))