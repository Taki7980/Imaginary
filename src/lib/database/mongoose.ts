import mongoose, { Mongoose } from "mongoose";

const MongoDB_Url = process.env.MONGODB_URI;

interface mongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: mongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MongoDB_Url) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MongoDB_Url, {
      bufferCommands: false,
      dbName: "imaginary",
    });
  }
  console.log("Mongo URI loaded:", !!process.env.MONGODB_URI);

  cached.conn = await cached.promise;
  return cached.conn;
};

