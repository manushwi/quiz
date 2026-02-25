# 🔬 Science Day — One-Time Proctored Programming Quiz Platform

A full-stack, real-time proctored exam system for college Science Day events. Students register once, attempt the quiz once, and cannot re-attempt. Built with React + Vite, Node.js + Express, MongoDB, and Socket.io.

---

## ✨ Features

- **One-Time Attempt**: Roll number uniqueness enforced at DB level
- **60-Minute Server Timer**: Server controls time — client cannot manipulate it
- **Proctoring System**: Detects tab switching, fullscreen exit, copy/paste, DevTools, window blur, internet disconnect
- **Auto-Submit**: On 3 violations OR timer expiry
- **30 Questions**: 15 C + 15 Python (MCQ + Coding)
- **Monaco Editor**: Syntax-highlighted code editor (like VS Code)
- **Live Code Execution**: Runs C (gcc) and Python (python3) with 5s timeout
- **Test Cases**: Auto-checks against hidden test cases on submission
- **Admin Dashboard**: Live view, violation log, CSV export
- **Socket.io**: Real-time updates for admin and student

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React 18 + Vite + TailwindCSS |
| Backend   | Node.js + Express      |
| Database  | MongoDB + Mongoose     |
| Realtime  | Socket.io              |
| Editor    | Monaco Editor          |
| Execution | gcc + python3 (child_process) |

---

## 🚀 Quick Start (Docker)

The easiest way to run everything:

```bash
# 1. Clone / unzip the project
cd quiz-platform

# 2. Start all services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Admin:    http://localhost:3000/admin
```

---

## 🚀 Manual Setup (Development)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas)
- gcc installed (`sudo apt install gcc`)
- python3 installed

### Backend

```bash
cd backend
npm install
# Set environment variables (or create .env):
# MONGO_URI=mongodb://localhost:27017/quizplatform
# ADMIN_SECRET=scienceday2024admin
# PORT=5000
npm run dev   # or: node src/index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

---

## 📁 Project Structure

```
quiz-platform/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server + Socket.io + all API routes
│   │   ├── models.js         # MongoDB schemas (Student, Answer, CodingSubmission, Violation)
│   │   ├── questions.js      # All 30 questions with test cases
│   │   └── codeRunner.js     # gcc + python3 execution engine
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── RegisterPage.jsx      # Student registration form
│   │   │   ├── InstructionsPage.jsx  # Rules + Start button
│   │   │   ├── ExamPage.jsx          # Main exam + proctoring
│   │   │   ├── SubmittedPage.jsx     # Confirmation screen
│   │   │   └── AdminPage.jsx         # Admin dashboard
│   │   ├── components/
│   │   │   └── QuestionPanel.jsx     # MCQ + Coding question UI
│   │   ├── api.js            # All API calls (axios)
│   │   └── App.jsx           # Router
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

---

## 📊 Database Collections

### `students`
```json
{
  "name": "Aarav Sharma",
  "year": "1st",
  "section": "A",
  "rollNumber": "CS2024001",
  "sessionId": "uuid",
  "startTime": "ISODate",
  "endTime": "ISODate",
  "submitted": true,
  "violationCount": 0,
  "score": 35
}
```

### `answers`
```json
{ "rollNumber": "CS2024001", "questionId": "c_mcq_1", "answer": 2 }
```

### `codingsubmissions`
```json
{ "rollNumber": "CS2024001", "questionId": "c_code_1", "code": "...", "passedTestCases": 3, "totalTestCases": 3 }
```

### `violations`
```json
{ "rollNumber": "CS2024001", "reason": "Tab switch detected", "timestamp": "ISODate" }
```

---

## 🔑 Admin Panel

Access at: `/admin`  
Default password: `scienceday2024admin`

**Change the admin password** by setting the `ADMIN_SECRET` environment variable.

Admin features:
- 📊 Live stats (registered / active / submitted / violations)
- 👁️ See all students with scores
- ⚡ Live active exam view
- ⚠️ Full violation log
- ⬇️ CSV export of all results

---

## 📝 Exam Structure

| Section | Type    | Count | Marks Each | Total |
|---------|---------|-------|-----------|-------|
| A — C   | MCQ     | 10    | 1         | 10    |
| A — C   | Coding  | 5     | 2         | 10    |
| B — Py  | MCQ     | 10    | 1         | 10    |
| B — Py  | Coding  | 5     | 2         | 10    |
| **Total** |       | **30** |          | **40** |

### Coding Problems
1. **Factorial** — C + Python
2. **Prime Number** — C + Python
3. **Palindrome** — C + Python
4. **Reverse Number** — C + Python
5. **Sum of Array** — C + Python

---

## 🛡️ Proctoring Details

| Violation Type | Detection Method |
|---------------|-----------------|
| Tab Switch | `document.visibilitychange` |
| Window Blur | `window.blur` event |
| Fullscreen Exit | `document.fullscreenchange` |
| Right Click | `contextmenu` event |
| Copy | `copy` event |
| Paste | `paste` event |
| DevTools | Window size difference threshold check |
| Internet Disconnect | `window.offline` event |

Each violation is saved to MongoDB with timestamp. 3 violations → instant auto-submit.

---

## ⚙️ Environment Variables

```bash
# Backend
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizplatform
ADMIN_SECRET=scienceday2024admin
```

---

## 🔒 Security Notes

- Roll numbers are stored uppercase and deduplicated at DB level (unique index)
- Session IDs are UUIDs — unguessable
- Exam timer is server-controlled; client timer is only for display
- Questions are served without answers — correctness evaluated server-side
- Test cases are hidden from the student

---

## 📦 Production Deployment

1. Set `ADMIN_SECRET` to a strong password
2. Use MongoDB Atlas or a secure MongoDB instance
3. Put behind HTTPS (use Nginx or Caddy as reverse proxy)
4. `docker-compose up -d` for background mode
