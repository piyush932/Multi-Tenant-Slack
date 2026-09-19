import mongoose from 'mongoose';
import connectDB from '../config/dbConfig.js';
import Message from '../schema/message.js';

async function run() {
  await connectDB();
  await Message.collection.createIndex({ body: 'text' });
  console.log('Text index on messages.body created.');
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
