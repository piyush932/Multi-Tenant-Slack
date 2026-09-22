import mongoose from 'mongoose';

const dmMessageSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

dmMessageSchema.index({ workspaceId: 1, senderId: 1, receiverId: 1, createdAt: 1 });

export default mongoose.model('DmMessage', dmMessageSchema);
