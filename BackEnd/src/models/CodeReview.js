const mongoose = require('mongoose');

const codeReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript']
  },
  review: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
  },
  metrics: {
    complexity: Number,
    maintainability: Number,
    readability: Number,
    security: Number
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search functionality, excluding language field
codeReviewSchema.index({ code: 'text', review: 'text', tags: 'text' }, { language_override: null });

const CodeReview = mongoose.model('CodeReview', codeReviewSchema);

module.exports = CodeReview; 