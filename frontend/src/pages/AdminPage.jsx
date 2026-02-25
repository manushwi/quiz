import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  adminVerify,
  adminGetStudents,
  adminGetViolations,
  adminGetAnswers,
  adminExportCSV
} from '../api';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState('');
  const [authError, setAuthError] = useState('');
  const [students, setStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [tab, setTab] = useState('students');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState(null);
  const socketRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await adminVerify(secret);
      if (data.valid) {
        sessionStorage.setItem('adminSecret', secret);
        setAuthed(true);
        loadData(secret);
      }
    } catch {
      setAuthError('Invalid admin password.');
    }
  };

  const loadData = async (s) => {
    setLoading(true);
    try {
      const [studRes, violRes] = await Promise.all([
        adminGetStudents(s),
        adminGetViolations(s)
      ]);
      setStudents(studRes.data);
      setViolations(violRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('adminSecret');
    if (saved) {
      setSecret(saved);
      adminVerify(saved).then(({ data }) => {
        if (data.valid) { setAuthed(true); loadData(saved); }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const socket = io();
    socketRef.current = socket;
    socket.emit('join:admin');
    socket.on('admin:update', () => loadData(sessionStorage.getItem('adminSecret')));
    return () => socket.disconnect();
  }, [authed]);

  const loadStudentAnswers = async (rollNumber) => {
    try {
      const s = sessionStorage.getItem('adminSecret');
      const { data } = await adminGetAnswers(s, rollNumber);
      setStudentAnswers(data);
    } catch {}
  };

  const activeStudents = students.filter(s => s.startTime && !s.submitted);
  const submittedStudents = students.filter(s => s.submitted);
  const avgScore = submittedStudents.length ? (submittedStudents.reduce((a, s) => a + s.score, 0) / submittedStudents.length).toFixed(1) : '—';

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm fade-in">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-amber-500 text-xs font-mono tracking-widest uppercase">Science Day 2024</p>
              <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
            </div>
          </div>
          <div className="card">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-ink-400 mb-1.5 uppercase tracking-wide">Admin Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter secret key"
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                />
              </div>
              {authError && <p className="text-red-400 text-sm">{authError}</p>}
              <button type="submit" className="btn-primary w-full">Access Panel</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-ink-950 border-b border-ink-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <h1 className="font-display font-bold text-ink-100">Admin Panel — Science Day Quiz</h1>
          <div className="w-2 h-2 rounded-full bg-emerald-500 ml-2 animate-pulse" />
          <span className="text-emerald-400 text-xs">Live</span>
        </div>
        <div className="flex gap-2">
          <a
            href={adminExportCSV(sessionStorage.getItem('adminSecret'))}
            className="btn-secondary text-xs"
            download="results.csv"
          >
            ⬇️ Export CSV
          </a>
          <button className="btn-secondary text-xs" onClick={() => loadData(sessionStorage.getItem('adminSecret'))}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 p-6">
        {[
          { label: 'Total Registered', value: students.length, color: 'text-ink-200' },
          { label: 'Currently Active', value: activeStudents.length, color: 'text-blue-400' },
          { label: 'Submitted', value: submittedStudents.length, color: 'text-emerald-400' },
          { label: 'Total Violations', value: violations.length, color: 'text-red-400' },
          { label: 'Avg Score', value: `${avgScore}/40`, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-ink-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-1 border-b border-ink-800 mb-6">
          {['students', 'active', 'violations'].map(t => (
            <button
              key={t}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-amber-500 text-amber-400' : 'border-transparent text-ink-500 hover:text-ink-300'}`}
              onClick={() => setTab(t)}
            >
              {t === 'active' ? 'Live Attempts' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'active' && activeStudents.length > 0 && (
                <span className="ml-1.5 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{activeStudents.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Students table */}
        {tab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800">
                  {['Roll No', 'Name', 'Year', 'Section', 'Status', 'Score', 'Violations', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-ink-500 font-medium uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-b border-ink-800/50 hover:bg-ink-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-ink-300 text-xs">{s.rollNumber}</td>
                    <td className="py-3 px-3 text-ink-200">{s.name}</td>
                    <td className="py-3 px-3 text-ink-400">{s.year}</td>
                    <td className="py-3 px-3 text-ink-400">{s.section}</td>
                    <td className="py-3 px-3">
                      {s.submitted ? (
                        <span className="bg-emerald-900/30 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-800">Submitted</span>
                      ) : s.startTime ? (
                        <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-800 animate-pulse">Active</span>
                      ) : (
                        <span className="bg-ink-800 text-ink-500 text-xs px-2 py-0.5 rounded border border-ink-700">Registered</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {s.submitted ? <span className="text-amber-400 font-semibold">{s.score}/40</span> : <span className="text-ink-600">—</span>}
                    </td>
                    <td className="py-3 px-3">
                      {s.violationCount > 0 ? (
                        <span className="text-red-400 font-mono font-semibold">{s.violationCount}</span>
                      ) : (
                        <span className="text-ink-600">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        className="text-xs text-amber-500 hover:text-amber-400 underline"
                        onClick={async () => {
                          setSelectedStudent(s);
                          await loadStudentAnswers(s.rollNumber);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-ink-600">No students registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Active students */}
        {tab === 'active' && (
          <div className="grid grid-cols-3 gap-4">
            {activeStudents.length === 0 ? (
              <p className="text-ink-600 col-span-3 text-center py-10">No active students right now.</p>
            ) : activeStudents.map(s => {
              const elapsed = s.startTime ? Math.floor((Date.now() - new Date(s.startTime)) / 60000) : 0;
              return (
                <div key={s._id} className="card border-blue-800/50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display font-semibold text-ink-200">{s.name}</p>
                      <p className="text-ink-500 text-xs font-mono">{s.rollNumber} · {s.year} Yr · Sec {s.section}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-1" />
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-3">
                    <span className="text-ink-400">⏱ {elapsed} min elapsed</span>
                    {s.violationCount > 0 && (
                      <span className="text-red-400">⚠️ {s.violationCount} violations</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Violations */}
        {tab === 'violations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800">
                  {['Roll Number', 'Reason', 'Timestamp'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs text-ink-500 font-medium uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {violations.map(v => (
                  <tr key={v._id} className="border-b border-ink-800/50 hover:bg-ink-800/30">
                    <td className="py-3 px-3 font-mono text-ink-300 text-xs">{v.rollNumber}</td>
                    <td className="py-3 px-3 text-red-300">{v.reason}</td>
                    <td className="py-3 px-3 text-ink-500 text-xs font-mono">{new Date(v.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {violations.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-10 text-ink-600">No violations recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student detail modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto py-10 px-4">
          <div className="card max-w-lg w-full fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink-100">{selectedStudent.name}</h3>
                <p className="text-ink-500 text-xs font-mono">{selectedStudent.rollNumber}</p>
              </div>
              <button className="text-ink-500 hover:text-ink-300 text-xl" onClick={() => { setSelectedStudent(null); setStudentAnswers(null); }}>✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
              <div className="bg-ink-800 rounded p-2 text-center">
                <div className="text-amber-400 font-bold text-lg">{selectedStudent.score}/40</div>
                <div className="text-ink-500">Score</div>
              </div>
              <div className="bg-ink-800 rounded p-2 text-center">
                <div className="text-red-400 font-bold text-lg">{selectedStudent.violationCount}</div>
                <div className="text-ink-500">Violations</div>
              </div>
              <div className="bg-ink-800 rounded p-2 text-center">
                <div className={`font-bold text-lg ${selectedStudent.submitted ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {selectedStudent.submitted ? 'Done' : 'Active'}
                </div>
                <div className="text-ink-500">Status</div>
              </div>
            </div>
            {studentAnswers && (
              <div>
                <p className="text-xs text-ink-500 mb-2">MCQ Answers: {studentAnswers.answers?.length || 0} saved</p>
                <p className="text-xs text-ink-500">Code Submissions: {studentAnswers.coding?.length || 0} problems attempted</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
