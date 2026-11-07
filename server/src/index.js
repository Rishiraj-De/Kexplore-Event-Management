import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import mongoose from 'mongoose';

const app = createApp();

try {
  await connectDB();
} catch (err) {
  console.error('✖ Could not connect to MongoDB:', err.message);
  process.exit(1);
}

const server = app.listen(env.port, () => {
  console.info(`🚀 Eventon API listening on http://localhost:${env.port}`);
});

// Graceful shutdown so Render deploys don't drop in-flight requests.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.info(`\n${signal} received — shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
