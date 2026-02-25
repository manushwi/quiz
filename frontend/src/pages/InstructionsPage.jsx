import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startExam } from '../api';

const rules = [
  { icon: '🖥️', text: 'Exam will run in fullscreen mode. Exiting fullscreen counts as a violation.' },
  { icon: '🚫', text: 'Switching tabs or minimizing window is strictly prohibited.' },
  { icon: '📋', text: 'Copy, paste, and right-click are disabled during the exam.' },
  { icon: '🔧', text: 'Opening DevTools will be detected and logged as a violation.' },
  { icon: '⚡', text: 'Internet disconnect will be detected. Ensure stable connection.' },
  { icon: '⚠️', text: '3 violations will result in IMMEDIATE automatic submission.' },
  { icon: '⏪', text: 'Browser back button is disabled. Do not refresh the page.' },
  { icon: '🔒', text: 'Each roll number can attempt the exam only once.' },
];

export default function InstructionsPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) navigate('/');
  }, []);

  const handleStart = async () => {
    const sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) { navigate('/'); return; }
    setLoading(true);
    setError('');
    try {
      await startExam(sessionId);

      // Request fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch {}

      navigate('/exam');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start exam.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl fade-in">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🔬</span>
          <p className="text-amber-500 text-xs font-mono tracking-widest uppercase">Science Day 2024 — Programming Quiz</p>
        </div>

        <h1 className="font-display text-3xl font-bold text-ink-100 mb-2">Exam Instructions</h1>
        <p className="text-ink-400 text-sm mb-8">Read all rules carefully before starting. Once started, the 60-minute timer cannot be paused.</p>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Questions', value: '30' },
            { label: 'Duration', value: '60 min' },
            { label: 'Total Marks', value: '40' },
            { label: 'Sections', value: 'C + Python' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <div className="font-display text-2xl font-bold text-amber-400">{s.value}</div>
              <div className="text-ink-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sections breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card border-ink-600">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs font-mono px-2 py-0.5 rounded">Section A</span>
              <span className="text-ink-300 font-display font-semibold">C Language</span>
            </div>
            <div className="space-y-1 text-sm text-ink-400">
              <p>• 10 MCQ questions — 1 mark each</p>
              <p>• 5 Coding questions — 2 marks each</p>
              <p className="text-ink-500 text-xs mt-2">Subtotal: 20 marks</p>
            </div>
          </div>
          <div className="card border-ink-600">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-700 text-white text-xs font-mono px-2 py-0.5 rounded">Section B</span>
              <span className="text-ink-300 font-display font-semibold">Python</span>
            </div>
            <div className="space-y-1 text-sm text-ink-400">
              <p>• 10 MCQ questions — 1 mark each</p>
              <p>• 5 Coding questions — 2 marks each</p>
              <p className="text-ink-500 text-xs mt-2">Subtotal: 20 marks</p>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="card mb-6">
          <h3 className="font-display font-semibold text-ink-200 mb-4">Proctoring Rules</h3>
          <div className="space-y-3">
            {rules.map((r, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-base mt-0.5">{r.icon}</span>
                <span className="text-ink-300">{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agree checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 group">
          <div className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${agreed ? 'bg-amber-500 border-amber-500' : 'border-ink-500 group-hover:border-amber-600'}`}
            onClick={() => setAgreed(!agreed)}>
            {agreed && <svg className="w-3 h-3 text-ink-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>}
          </div>
          <span className="text-ink-300 text-sm leading-relaxed" onClick={() => setAgreed(!agreed)}>
            I have read and understood all the exam rules. I agree to follow them strictly. I understand that violations will be logged and 3 violations will auto-submit my exam.
          </span>
        </label>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm mb-4">{error}</div>
        )}

        <button
          className="btn-primary w-full text-base py-4 text-base"
          disabled={!agreed || loading}
          onClick={handleStart}
        >
          {loading ? 'Starting...' : '🚀 Start Exam — Enter Fullscreen'}
        </button>
      </div>
    </div>
  );
}
