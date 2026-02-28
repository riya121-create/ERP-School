import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  evaluationPeriod: {
    type: String,
    required: true
  },
  criteria: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    weight: {
      type: Number,
      default: 1
    }
  }],
  ratings: [{
    criterion: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comments: String
  }],
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comments: {
    type: String,
    required: true
  },
  strengths: [String],
  areasForImprovement: [String],
  goals: [{
    description: String,
    deadline: Date,
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending"
    }
  }],
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  evaluationDate: {
    type: Date,
    default: Date.now
  },
  nextEvaluationDate: Date
}, {
  timestamps: true
});

export default mongoose.model("Performance", performanceSchema);
