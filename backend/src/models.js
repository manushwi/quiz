const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true, unique: true },
  startTime: { type: Date },
  endTime: { type: Date },
  submitted: { type: Boolean, default: false },
  violationCount: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  registeredAt: { type: Date, default: Date.now }
});

const answerSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  questionId: { type: String, required: true },
  answer: { type: mongoose.Schema.Types.Mixed }, // index for MCQ or code string
  updatedAt: { type: Date, default: Date.now }
});

const codingSubmissionSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  questionId: { type: String, required: true },
  code: { type: String },
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const violationSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
const Answer = mongoose.model('Answer', answerSchema);
const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);
const Violation = mongoose.model('Violation', violationSchema);

module.exports = { Student, Answer, CodingSubmission, Violation };
