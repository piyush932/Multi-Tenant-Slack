import mongoose from 'mongoose';
import WebhookEvent from '../schema/webhookEvent.js';

export async function withIdempotency(providerEventId, type, payload, applyEffect) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    try {
      await WebhookEvent.create([{ providerEventId, type, payload }], { session });
    } catch (err) {
      if (err.code === 11000) {
        await session.commitTransaction();
        return { replayed: true };
      }
      throw err;
    }

    const result = await applyEffect(session);
    await session.commitTransaction();
    return { replayed: false, result };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
