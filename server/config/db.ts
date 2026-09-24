import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;
let fallbackMode = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  // If no MONGODB_URI is explicitly set or if it's set to localhost in an environment without a local daemon,
  // gracefully operate using the In-Memory Data Engine
  if (!MONGODB_URI || MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost')) {
    fallbackMode = true;
    console.log('[Database] Active Database: In-Memory Data Engine initialized (set MONGODB_URI to connect to an external MongoDB Atlas cluster).');
    return;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 3000,
    };
    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
  } catch (error: any) {
    fallbackMode = true;
    console.log(`[Database] External MongoDB connection skipped (${error.message}). Utilizing In-Memory Data Engine.`);
  }
}

export function isDbFallback(): boolean {
  return fallbackMode;
}
