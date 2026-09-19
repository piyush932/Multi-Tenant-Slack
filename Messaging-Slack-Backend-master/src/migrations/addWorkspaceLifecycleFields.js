import mongoose from 'mongoose';
import connectDB from '../config/dbConfig.js';
import Workspace from '../schema/workspace.js';

async function run() {
  await connectDB();
  const result = await Workspace.updateMany(
    { plan: { $exists: false } },
    { $set: { plan: 'free', status: 'active', deletedAt: null } }
  );
  console.log(`Backfilled ${result.modifiedCount} workspace(s) with plan/status/deletedAt.`);
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
