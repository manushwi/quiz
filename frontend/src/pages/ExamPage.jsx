import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getQuestions, saveAnswer, logViolation, submitExam, getSession } from '../api';
import QuestionPanel from '../components/QuestionPanel';

const TOTAL_QUESTIONS = 30;

export default function ExamPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: value }
  const [visited, setVisited] = useState({}); // { questionId: true }
  const [timeLeft, setTimeLeft] = useState(3600);
  const [violations, setViolations] = useState(0);
  const [violationMsg, setViolationMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const violationCooldown = useRef(false);
  const sessionId = sessionStorage.getItem('sessionId');

  // Block back navigation
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => window.history.pushState(null, '', window.location.href);
    return () => { window.onpopstate = null; };
  }, []);

  // Socket.io
  useEffect(() => {
    if (!sessionId) { navigate('/'); return; }
    const socket = io();
    socketRef.current = socket;
    socket.emit('join:session', sessionId);

    socket.on('exam:autosubmit', ({ reason }) => {
      setSubmitting(true);
      setViolationMsg(`Exam auto-submitted: ${reason}`);
      setTimeout(() => navigate('/submitted'), 2000);
    });

    socket.on('violation:warning', ({ count, reason }) => {
      setViolations(count);
      showViolationWarning(`Violation #${count}: ${reason}`);
    });

    return () => socket.disconnect();
  }, []);

  // Load session + questions
  useEffect(() => {
    if (!sessionId) { navigate('/'); return; }
    (async () => {
      try {
        const [sessionRes, questionsRes] = await Promise.all([
          getSession(sessionId),
          getQuestions(sessionId)
        ]);
        const remaining = sessionRes.data.timeRemaining;
        if (remaining !== null) setTimeLeft(Math.max(0, Math.floor(remaining / 1000)));
        setQuestions(questionsRes.data);
        setVisited({ [questionsRes.data[0]?.id]: true });
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/submitted');
        } else {
          navigate('/');
        }
      }
    })();
  }, []);

  // Client-side timer
  useEffect(() => {
    if (loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit('Time limit exceeded');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading]);

  // Proctoring
  useEffect(() => {
    if (loading) return;

    const reportViolation = async (reason) => {
      if (violationCooldown.current) return;
      violationCooldown.current = true;
      setTimeout(() => { violationCooldown.current = false; }, 3000);

      try {
        const { data } = await logViolation(sessionId, reason);
        setViolations(data.violations || 0);
        showViolationWarning(`⚠️ Violation: ${reason}`);
        if (data.autoSubmitted) {
          setTimeout(() => navigate('/submitted'), 1500);
        }
      } catch {}
    };

    // Tab switch / visibility
    const handleVisibility = () => {
      if (document.hidden) reportViolation('Tab switch detected');
    };

    // Window blur
    const handleBlur = () => reportViolation('Window minimized or switched');

    // Fullscreen exit
    const handleFullscreen = () => {
      if (!document.fullscreenElement) reportViolation('Fullscreen exited');
    };

    // Right click
    const handleContextMenu = (e) => { e.preventDefault(); reportViolation('Right-click attempted'); };

    // Copy/paste
    const handleCopy = (e) => { e.preventDefault(); reportViolation('Copy attempted'); };
    const handlePaste = (e) => { e.preventDefault(); reportViolation('Paste attempted'); };

    // DevTools detection
    let devtoolsCheck;
    const detectDevtools = () => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        reportViolation('DevTools opened');
      }
    };
    devtoolsCheck = setInterval(detectDevtools, 2000);

    // Internet disconnect
    const handleOffline = () => reportViolation('Internet disconnected');

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('offline', handleOffline);
      clearInterval(devtoolsCheck);
    };
  }, [loading]);

  const showViolationWarning = (msg) => {
    setViolationMsg(msg);
    setTimeout(() => setViolationMsg(''), 4000);
  };

  const handleAutoSubmit = async (reason) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      await submitExam(sessionId);
    } catch {}
    navigate('/submitted');
  };

  const handleManualSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setConfirmSubmit(false);
    try {
      await submitExam(sessionId);
    } catch {}
    if (document.fullscreenElement) document.exitFullscreen();
    navigate('/submitted');
  };

  const handleAnswerChange = async (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    try {
      await saveAnswer(sessionId, questionId, value);
    } catch {}
  };

  const goToQuestion = (index) => {
    const q = questions[index];
    if (q) setVisited(prev => ({ ...prev, [q.id]: true }));
    setCurrentQ(index);
  };

  const getQuestionStatus = (q, index) => {
    if (index === currentQ) return 'blue';
    if (answers[q.id] !== undefined) return 'green';
    if (visited[q.id]) return 'red';
    return 'gray';
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-ink-400">Loading exam...</p>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const timeWarning = timeLeft < 300;

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none">
      {/* Top bar */}
      <div className="bg-ink-950 border-b border-ink-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔬</span>
          <span className="font-display font-semibold text-ink-200 text-sm">Science Day — Programming Quiz</span>
          <span className="text-ink-600 text-xs">|</span>
          <span className="text-ink-400 text-xs font-mono">{sessionStorage.getItem('rollNumber')}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Violations */}
          <div className={`flex items-center gap-1.5 ${violations > 0 ? 'text-red-400' : 'text-ink-500'}`}>
            <span className="text-xs">Violations:</span>
            {[0,1,2].map(i => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < violations ? 'bg-red-500' : 'bg-ink-700'}`} />
            ))}
          </div>

          {/* Timer */}
          <div className={`font-mono text-lg font-bold px-3 py-1 rounded-lg ${timeWarning ? 'bg-red-900/50 text-red-400 pulse-warn' : 'bg-ink-800 text-amber-400'}`}>
            {formatTime(timeLeft)}
          </div>

          {/* Submit */}
          <button
            className="bg-red-700 hover:bg-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
            onClick={() => setConfirmSubmit(true)}
            disabled={submitting}
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Violation warning banner */}
      {violationMsg && (
        <div className="bg-red-900 border-b border-red-700 px-4 py-2 text-red-200 text-sm text-center font-medium fade-in">
          {violationMsg} — {3 - violations} warnings remaining before auto-submit
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: Question navigator */}
        <div className="w-56 flex-shrink-0 bg-ink-950 border-r border-ink-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-ink-800">
            <p className="text-ink-400 text-xs uppercase tracking-wide mb-1">Progress</p>
            <div className="w-full bg-ink-800 rounded-full h-1.5 mb-1">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }} />
            </div>
            <p className="text-ink-500 text-xs">{answeredCount}/{TOTAL_QUESTIONS} answered</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Section A */}
            <div>
              <p className="text-xs font-mono text-blue-400 mb-2 uppercase tracking-wider">Section A — C</p>
              <div className="grid grid-cols-5 gap-1">
                {questions.filter(q => q.section === 'C').map((q, i) => {
                  const globalIndex = questions.indexOf(q);
                  const status = getQuestionStatus(q, globalIndex);
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(globalIndex)}
                      className={`w-full aspect-square rounded text-xs font-mono font-medium transition-all hover:scale-110 q-${status}`}
                    >
                      {q.number}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section B */}
            <div>
              <p className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">Section B — Python</p>
              <div className="grid grid-cols-5 gap-1">
                {questions.filter(q => q.section === 'Python').map((q) => {
                  const globalIndex = questions.indexOf(q);
                  const status = getQuestionStatus(q, globalIndex);
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(globalIndex)}
                      className={`w-full aspect-square rounded text-xs font-mono font-medium transition-all hover:scale-110 q-${status}`}
                    >
                      {q.number}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-ink-800">
              <p className="text-ink-600 text-xs mb-2">Legend:</p>
              <div className="space-y-1.5">
                {[
                  { color: 'bg-ink-600', label: 'Not visited' },
                  { color: 'bg-blue-600', label: 'Current' },
                  { color: 'bg-emerald-700', label: 'Answered' },
                  { color: 'bg-red-800', label: 'Visited' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${l.color}`} />
                    <span className="text-ink-500 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main question area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {q && (
            <QuestionPanel
              question={q}
              currentIndex={currentQ}
              totalQuestions={TOTAL_QUESTIONS}
              answer={answers[q.id]}
              sessionId={sessionId}
              onAnswer={(val) => handleAnswerChange(q.id, val)}
              onNext={() => { if (currentQ < TOTAL_QUESTIONS - 1) goToQuestion(currentQ + 1); }}
              onPrev={() => { if (currentQ > 0) goToQuestion(currentQ - 1); }}
            />
          )}
        </div>
      </div>

      {/* Confirm submit modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="card max-w-sm w-full mx-4 text-center fade-in">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-display text-lg font-bold text-ink-100 mb-2">Submit Exam?</h3>
            <p className="text-ink-400 text-sm mb-2">You have answered {answeredCount} of {TOTAL_QUESTIONS} questions.</p>
            <p className="text-red-400 text-xs mb-6">This action cannot be undone. Your exam will be submitted immediately.</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmSubmit(false)}>Cancel</button>
              <button
                className="flex-1 bg-red-700 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                onClick={handleManualSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
