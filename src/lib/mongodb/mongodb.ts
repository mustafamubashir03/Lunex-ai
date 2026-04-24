// getting-started.js
import mongoose from "mongoose"

const MONGO_URI = process.env.MONGO_URI

if(!MONGO_URI){
    throw new Error("MONGODB_URI is missing")
}

export async function connectDB(){
    await mongoose.connect(MONGO_URI || "")
    console.log("DB has been connected")
}


