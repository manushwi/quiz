import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', year: '', section: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.year || !form.section.trim() || !form.rollNumber.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await register(form);
      sessionStorage.setItem('sessionId', data.sessionId);
      sessionStorage.setItem('rollNumber', data.rollNumber);
      navigate('/instructions');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(#fbbf24 1px, transparent 1px), linear-gradient(90deg, #fbbf24 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-md relative fade-in">
        {/* Header badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🔬</span>
          <div>
            <p className="text-amber-500 text-xs font-mono tracking-widest uppercase">Science Day 2024</p>
            <h1 className="font-display text-2xl font-bold text-ink-100">Programming Quiz</h1>
          </div>
        </div>

        <div className="card shadow-2xl">
          <h2 className="font-display text-xl font-semibold text-ink-100 mb-1">Student Registration</h2>
          <p className="text-ink-400 text-sm mb-6">Enter your details to begin the exam. You can only attempt this once.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-ink-400 font-medium mb-1.5 uppercase tracking-wide">Full Name</label>
              <input
                className="input-field"
                placeholder="e.g. Aarav Sharma"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs text-ink-400 font-medium mb-1.5 uppercase tracking-wide">Year</label>
              <select
                className="input-field"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              >
                <option value="">Select Year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-ink-400 font-medium mb-1.5 uppercase tracking-wide">Section</label>
              <input
                className="input-field"
                placeholder="e.g. A, B, C"
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-xs text-ink-400 font-medium mb-1.5 uppercase tracking-wide">Roll Number</label>
              <input
                className="input-field"
                placeholder="e.g. CS2024001"
                value={form.rollNumber}
                onChange={e => setForm({ ...form, rollNumber: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Registering...' : 'Continue to Instructions →'}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-600 text-xs mt-6">
          This platform is monitored. Violations will be logged.
        </p>
      </div>
    </div>
  );
}
