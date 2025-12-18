import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
  },
  explanation: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: true });

const learningModuleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    content: {
      introduction: {
        type: String,
        required: true,
      },
      sections: [{
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        examples: [String],
        keyPoints: [String],
      }],
      summary: {
        type: String,
        required: true,
      },
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length >= 3;
        },
        message: 'Module must have at least 3 questions',
      },
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 5,
    },
    prerequisites: [{
      type: String,
    }],
    learningObjectives: [{
      type: String,
      required: true,
    }],
    tags: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
learningModuleSchema.index({ level: 1, order: 1 });
learningModuleSchema.index({ isActive: 1, level: 1 });
learningModuleSchema.index({ tags: 1 });

// Calculate total points before saving
learningModuleSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  }
  next();
});

const LearningModule = mongoose.model('LearningModule', learningModuleSchema);

export default LearningModule;