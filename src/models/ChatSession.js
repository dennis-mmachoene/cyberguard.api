import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  wasBlocked: {
    type: Boolean,
    default: false,
  },
  blockReason: {
    type: String,
    default: null,
  },
}, { _id: true });

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: [messageSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockedMessageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1, isActive: 1 });
chatSessionSchema.index({ lastMessageAt: -1 });

// TTL index to auto-delete old sessions after 7 days of inactivity
chatSessionSchema.index({ lastMessageAt: 1 }, { expireAfterSeconds: 604800 });

// Add message to session
chatSessionSchema.methods.addMessage = function(role, content, wasBlocked = false, blockReason = null) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    wasBlocked,
    blockReason,
  });
  
  this.lastMessageAt = new Date();
  this.messageCount += 1;
  
  if (wasBlocked) {
    this.blockedMessageCount += 1;
  }
  
  // Keep only last 20 messages to prevent session from growing too large
  if (this.messages.length > 20) {
    this.messages = this.messages.slice(-20);
  }
  
  return this;
};

// End session
chatSessionSchema.methods.endSession = function() {
  this.isActive = false;
  return this;
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;