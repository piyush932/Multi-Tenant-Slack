import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema(
  {
    providerEventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed },
    processedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default mongoose.model('WebhookEvent', webhookEventSchema);
