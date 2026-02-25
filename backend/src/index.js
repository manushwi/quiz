const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const { Student, Answer, CodingSubmission, Violation } = require('./models');
const questions = require('./questions');
const { judgeQuestion } = require("./judgeController");
const { executeCode } = require("./localRunner");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.set('trust proxy', 1);

const EXAM_DURATION_MS = 60 * 60 * 1000; // 60 minutes
const MAX_VIOLATIONS = 3;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'scienceday2024admin';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:mongo100xdev@cluster0.0jixkji.mongodb.net/quiz';

// Active timers: sessionId -> timeout handle
const activeTimers = {};

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// ─────────────────────────────────────────────
// HELPER: calculate score
async function calculateScore(rollNumber) {
  const allAnswers = await Answer.find({ rollNumber });
  const allCoding = await CodingSubmission.find({ rollNumber });

  let score = 0;
  for (const ans of allAnswers) {
    const q = questions.find(q => q.id === ans.questionId);
    if (!q || q.type !== 'mcq') continue;
    if (ans.answer === q.answer) score += 1;
  }
  for (const sub of allCoding) {
    const q = questions.find(q => q.id === sub.questionId);
    if (!q || q.type !== 'coding') continue;
    const ratio = sub.passedTestCases / sub.totalTestCases;
    if (ratio === 1) score += 2;
    else if (ratio > 0) score += 1;
  }
  return score;
}

// HELPER: auto-submit
async function autoSubmit(sessionId, reason) {
  const student = await Student.findOne({ sessionId });
  if (!student || student.submitted) return;

  const score = await calculateScore(student.rollNumber);
  student.submitted = true;
  student.endTime = new Date();
  student.score = score;
  await student.save();

  if (activeTimers[sessionId]) {
    clearTimeout(activeTimers[sessionId]);
    delete activeTimers[sessionId];
  }

  io.to(sessionId).emit('exam:autosubmit', { reason, score });
  io.emit('admin:update');
}

// Start server timer for a session
function startExamTimer(sessionId, startTime) {
  const elapsed = Date.now() - startTime.getTime();
  const remaining = EXAM_DURATION_MS - elapsed;
  if (remaining <= 0) {
    autoSubmit(sessionId, 'Time limit exceeded');
    return;
  }
  if (activeTimers[sessionId]) clearTimeout(activeTimers[sessionId]);
  activeTimers[sessionId] = setTimeout(() => {
    autoSubmit(sessionId, 'Time limit exceeded');
  }, remaining);
}

// ─────────────────────────────────────────────
// ROUTES

// Register student
app.post('/api/register', async (req, res) => {
  console.log('Register request:', req.body);
  try {
    const { name, year, section, rollNumber } = req.body;
    if (!name || !year || !section || !rollNumber) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await Student.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({ error: 'You have already attempted the quiz.' });
    }

    const sessionId = uuidv4();
    const student = new Student({
      name: name.trim(),
      year,
      section: section.trim().toUpperCase(),
      rollNumber: rollNumber.trim().toUpperCase(),
      sessionId
    });
    await student.save();

    res.json({ sessionId, rollNumber: student.rollNumber });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already attempted the quiz.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

// Verify session (for page reload protection)
app.get('/api/session/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student) return res.status(404).json({ error: 'Session not found.' });
  if (student.submitted) return res.status(403).json({ error: 'Exam already submitted.' });
  res.json({ student, timeRemaining: student.startTime ? EXAM_DURATION_MS - (Date.now() - student.startTime.getTime()) : null });
});

// Start exam
app.post('/api/start/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student) return res.status(404).json({ error: 'Session not found.' });
  if (student.submitted) return res.status(403).json({ error: 'Exam already submitted.' });
  if (student.startTime) {
    // Already started - resume
    const remaining = EXAM_DURATION_MS - (Date.now() - student.startTime.getTime());
    if (remaining <= 0) {
      await autoSubmit(student.sessionId, 'Time expired');
      return res.status(403).json({ error: 'Time expired.' });
    }
    startExamTimer(student.sessionId, student.startTime);
    return res.json({ started: true, startTime: student.startTime, remaining });
  }

  student.startTime = new Date();
  await student.save();
  startExamTimer(student.sessionId, student.startTime);

  io.emit('admin:update');
  res.json({ started: true, startTime: student.startTime, remaining: EXAM_DURATION_MS });
});

// Get questions (only if session valid)
app.get('/api/questions/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student || student.submitted) return res.status(403).json({ error: 'Access denied.' });
  if (!student.startTime) return res.status(400).json({ error: 'Exam not started.' });

  // Strip answers from MCQ before sending
  const safeQuestions = questions.map(q => {
    const { answer, testCases, ...rest } = q;
    return {
      ...rest,
      testCases: testCases ? testCases.map(tc => ({ input: tc.input, expected: tc.expected })) : undefined
    };
  });
  res.json(safeQuestions);
});

// Save MCQ answer
app.post('/api/answer/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student || student.submitted) return res.status(403).json({ error: 'Access denied.' });

  const { questionId, answer } = req.body;
  await Answer.findOneAndUpdate(
    { rollNumber: student.rollNumber, questionId },
    { rollNumber: student.rollNumber, questionId, answer, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  res.json({ saved: true });
});

// Run code
app.post('/api/run/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student || student.submitted)
    return res.status(403).json({ error: 'Access denied.' });

  const { questionId, language, code, input } = req.body;

  try {
    if (input !== undefined) {
      const result = await executeCode(language, code, input);
      return res.json(result);
    }
    const result = await judgeQuestion(questionId, language, code);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Execution failed.' });
  }
});

// Submit code with test cases
app.post('/api/submit-code/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student || student.submitted) return res.status(403).json({ error: 'Access denied.' });

  const { questionId, code, language } = req.body;
  const q = questions.find(q => q.id === questionId);
  if (!q) return res.status(404).json({ error: 'Question not found.' });

  try {
    const result = await judgeQuestion(questionId, language, code);

    const passed = result.passed;
    const total = result.total;

    await CodingSubmission.findOneAndUpdate(
      { rollNumber: student.rollNumber, questionId },
      { rollNumber: student.rollNumber, questionId, code, passedTestCases: passed, totalTestCases: total, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Also save as answer
    await Answer.findOneAndUpdate(
      { rollNumber: student.rollNumber, questionId },
      { rollNumber: student.rollNumber, questionId, answer: code, updatedAt: new Date() },
      { upsert: true }
    );

    res.json({ results: result.results, passed, total: q.testCases.length });
  } catch (err) {
    res.status(500).json({ error: 'Test execution failed.' });
  }
});

// Log violation
app.post('/api/violation/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student || student.submitted) return res.json({ submitted: false });

  const { reason } = req.body;
  const violation = new Violation({ rollNumber: student.rollNumber, reason });
  await violation.save();

  student.violationCount = (student.violationCount || 0) + 1;
  await student.save();

  io.emit('admin:update');

  if (student.violationCount >= MAX_VIOLATIONS) {
    await autoSubmit(student.sessionId, 'Maximum violations reached');
    return res.json({ autoSubmitted: true, violations: student.violationCount });
  }

  io.to(student.sessionId).emit('violation:warning', { count: student.violationCount, reason });
  res.json({ autoSubmitted: false, violations: student.violationCount });
});

// Final submit
app.post('/api/submit/:sessionId', async (req, res) => {
  const student = await Student.findOne({ sessionId: req.params.sessionId });
  if (!student) return res.status(404).json({ error: 'Session not found.' });
  if (student.submitted) return res.json({ submitted: true, score: student.score });

  const score = await calculateScore(student.rollNumber);
  student.submitted = true;
  student.endTime = new Date();
  student.score = score;
  await student.save();

  if (activeTimers[student.sessionId]) {
    clearTimeout(activeTimers[student.sessionId]);
    delete activeTimers[student.sessionId];
  }

  io.emit('admin:update');
  res.json({ submitted: true, score });
});

// ─────────────────────────────────────────────
// ADMIN ROUTES
function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/admin/students', adminAuth, async (req, res) => {
  const students = await Student.find().sort({ registeredAt: -1 });
  res.json(students);
});

app.get('/api/admin/violations', adminAuth, async (req, res) => {
  const violations = await Violation.find().sort({ timestamp: -1 });
  res.json(violations);
});

app.get('/api/admin/answers/:rollNumber', adminAuth, async (req, res) => {
  const answers = await Answer.find({ rollNumber: req.params.rollNumber });
  const coding = await CodingSubmission.find({ rollNumber: req.params.rollNumber });
  res.json({ answers, coding });
});

app.get('/api/admin/export-csv', adminAuth, async (req, res) => {
  const students = await Student.find().sort({ registeredAt: 1 });
  const header = 'Roll Number,Name,Year,Section,Score,Submitted,Start Time,End Time,Violations\n';
  const rows = students.map(s =>
    `${s.rollNumber},"${s.name}",${s.year},${s.section},${s.score},${s.submitted},${s.startTime || ''},${s.endTime || ''},${s.violationCount}`
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="results.csv"');
  res.send(header + rows);
});

// Admin verify
app.post('/api/admin/verify', (req, res) => {
  const { secret } = req.body;
  if (secret === ADMIN_SECRET) res.json({ valid: true });
  else res.status(401).json({ valid: false });
});

// ─────────────────────────────────────────────
// SOCKET.IO
io.on('connection', (socket) => {
  socket.on('join:session', (sessionId) => {
    socket.join(sessionId);
  });
  socket.on('join:admin', () => {
    socket.join('admin');
  });
});

// Restore timers on server restart
async function restoreTimers() {
  const activeStudents = await Student.find({ submitted: false, startTime: { $ne: null } });
  for (const s of activeStudents) {
    startExamTimer(s.sessionId, s.startTime);
  }
  console.log(`✅ Restored ${activeStudents.length} active exam timers`);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  restoreTimers();
});
