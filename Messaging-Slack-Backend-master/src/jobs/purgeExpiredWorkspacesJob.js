import { Queue, Worker } from 'bullmq';
import redisConfig from '../config/redisConfig.js';
import { purgeExpiredSoftDeletes } from '../services/workspaceLifecycleService.js';

export const purgeQueue = new Queue('purge-expired-workspaces', { connection: redisConfig });

export async function schedulePurgeJob() {
  await purgeQueue.add(
    'daily-purge',
    {},
    { repeat: { every: 24 * 60 * 60 * 1000 }, removeOnComplete: true }
  );
}

export const purgeWorker = new Worker(
  'purge-expired-workspaces',
  async () => {
    await purgeExpiredSoftDeletes();
  },
  { connection: redisConfig }
);

purgeWorker.on('failed', (job, err) => {
  console.error('[purgeExpiredWorkspacesJob] failed:', err.message);
});
