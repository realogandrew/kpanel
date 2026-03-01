/**
 * MongoDB connection singleton.
 * Used by app startup and by models.
 */
import mongoose from 'mongoose';
import { config } from '../config/index.js';

let isConnected = false;

export async function connectDb() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
    });
    isConnected = true;
    console.log('[db] Connected to MongoDB');
    return conn;
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    throw err;
  }
}

export async function disconnectDb() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('[db] Disconnected from MongoDB');
}
