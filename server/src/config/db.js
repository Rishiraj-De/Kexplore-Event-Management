import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  mongoose.connection.on('disconnected', () => console.warn('⚠ MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.info('✔ MongoDB reconnected'));

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15_000,
    maxPoolSize: 10,
  });
  console.info(`✔ MongoDB connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mongoose.connection;
}

export function dbState() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] ?? 'unknown';
}
