
import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
    }
},{timestamps:true, strict:false})

export const User = mongoose.models.User || mongoose.model("User", userSchema)

