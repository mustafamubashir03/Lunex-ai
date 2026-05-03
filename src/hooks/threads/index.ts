
import { createThread, getAllThreadsByUserId, updateThreadTitle, deleteThread } from "@/client-api/threads";
import { useMutation, useQuery } from "@tanstack/react-query";


export const useGetAllThreadsByUserId = ({ userId }: { userId: string }) => {
    const { data, isError, isPending, isLoading } = useQuery({
        queryFn: () => getAllThreadsByUserId({ userId }),
        queryKey: ["threads_by_userId", userId],
        enabled: !!userId
    })
    return ({
        data,
        isError,
        isPending,
        isLoading
    })
}

export const useCreateThreadMutation = ({ userId }: { userId: string }) => {
    const { mutateAsync: createThreadMutation, isPending, isError } = useMutation({
        mutationFn: () => createThread({ userId }),
        mutationKey: ["createThread", userId],
    })
    return ({
        createThreadMutation,
        isPending,
        isError
    })
}

export const useUpdateThreadMutation = ({ userId }: { userId: string }) => {
    const { mutateAsync: updateThreadMutation, isPending, isError } = useMutation({
        mutationFn: ({ threadId, title }: { threadId: string, title: string }) => updateThreadTitle({ threadId, userId, title }),
        mutationKey: ["updateThread", userId],
    })
    return ({
        updateThreadMutation,
        isPending,
        isError
    })
}

export const useDeleteThreadMutation = ({ userId }: { userId: string }) => {
    const { mutateAsync: deleteThreadMutation, isPending, isError } = useMutation({
        mutationFn: ({ threadId }: { threadId: string }) => deleteThread({ threadId, userId }),
        mutationKey: ["deleteThread", userId],
    })
    return ({
        deleteThreadMutation,
        isPending,
        isError
    })
}
