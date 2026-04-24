"use server"

import { User } from "@/models/userSchema";
import mongoose from "mongoose"


export const findUserByEmail = async(email:string)=>{
    try{
        const user = await User.findOne({
            email
        })
        return user;

    }catch(e){
        throw new Error("user not found")
    }

}


export const createUser = async({id,name,email,image,access_token,refresh_token}:{id:string,name:string,image:string,email:string,access_token:string,refresh_token:string})=>{
    try{
        const user = await User.findOneAndUpdate({email},{
            googleId:id,
            name,
            email,
            image,
            googleAccessToken:access_token,
            googleRefreshToken:refresh_token
        },{
            new:true,
            upsert:true,
            runValidators:true,
            lean:true
        })
        return user;
    }catch(e){
        throw new Error("User creation failed")
    }
}