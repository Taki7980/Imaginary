import mongoose, { Mongoose } from "mongoose";

const MongoDB_Url = process.env.MONGODB_URL;

interface mongooseConnection {
      conn: Mongoose | null;
      promise: Promise<Mongoose> | null;
}

let cached: mongooseConnection = (global as any).mongoose;

if (!cached) {
      cached = (global as any).mongoose = { conn: null, promise: null }
}

export const connectToDatabase = async () => {
      if (cached.conn) {
            return cached.conn;
      }
      if (!MongoDB_Url) {
            throw new Error("MongoDB_Url is not defined");
      }

      if (!cached.promise) {
            const opts = {
                  bufferCommands: false,
                  dbName:"imaginary",
            };

            cached.promise = cached.promise || mongoose.connect(MongoDB_Url, opts)
      }
      cached.conn = await cached.promise;
      return cached.conn;
}

