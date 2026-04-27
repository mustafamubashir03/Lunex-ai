import { MongoClient } from "mongodb";

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"');
}

const uri = process.env.MONGO_URI;

let client: MongoClient;
let db: any;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
    _mongoDb?: any;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri);
    globalWithMongo._mongoDb = globalWithMongo._mongoClient.db();
  }
  client = globalWithMongo._mongoClient;
  db = globalWithMongo._mongoDb;
} else {
  client = new MongoClient(uri);
  db = client.db();
}

export { client, db };
