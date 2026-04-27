import { create } from "zustand";


type activeUserStoreType = {
    activeUser: {
        id: string,
        name: string,
        email: string,
        image: string,
    } | null,
    setActiveUser:(activeUserData:any)=>void
}

export const useActiveUserStore = create<activeUserStoreType>((set)=>({
    activeUser:null,
    setActiveUser:(activeUserData:any)=>set({activeUser:activeUserData})
}))