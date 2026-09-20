import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    unique: true
  },
  description: {
    type: String
  },
  members: [
    {
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
      }
    }
  ],
  joinCode: {
    type: String,
    required: [true, 'Join code is required']
  },
  channels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel'
    }
  ],
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
