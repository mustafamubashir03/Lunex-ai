
import { createThread, getAllThreadsByUserId } from "@/client-api/threads";
import { useMutation, useQuery } from "@tanstack/react-query";


export const useGetAllThreadsByUserId = ({userId}:{userId:string})=>{
    const {data,isError,isPending,isLoading} = useQuery({
        queryFn:()=>getAllThreadsByUserId({userId}),
        queryKey:["threads_by_userId",userId],
        enabled: !!userId
    })
    return({
        data,
        isError,
        isPending,
        isLoading
    })
}

export const useCreateThreadMutation = ({userId}:{userId:string})=>{
    const{mutateAsync:createThreadMutation,isPending,isError} = useMutation({
        mutationFn:()=>createThread({userId}),
        mutationKey:["createThread",userId],
    })
    return({
        createThreadMutation,
        isPending,
        isError
    })
}
