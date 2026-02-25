import React from 'react';

export default function SubmittedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md fade-in">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="font-display text-3xl font-bold text-ink-100 mb-3">
          Exam Submitted
        </h1>
        <p className="text-ink-300 text-base mb-2">
          Your responses have been recorded successfully.
        </p>
        <p className="text-ink-500 text-sm mb-8">
          Thank you for participating in the Science Day Programming Quiz. Results will be announced later.
        </p>
        <div className="card text-left">
          <p className="text-ink-400 text-sm">
            <span className="text-amber-400 font-semibold">Note:</span> You cannot re-access the exam. If you have any concerns, please contact the exam coordinator.
          </p>
        </div>
        <p className="text-ink-700 text-xs mt-8">You may now close this window.</p>
      </div>
    </div>
  );
}
