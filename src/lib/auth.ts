import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import dotenv from "dotenv"
dotenv.config()
const client = new MongoClient(process.env.MONGO_URI ||"");
const db = client.db();

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL, 
    emailAndPassword: {    
        enabled: true
    },
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline", 
            prompt: "select_account consent",  
        }, 
    },
  database: mongodbAdapter(db, {
    client
  }),
});