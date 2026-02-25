import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { runCode, submitCode } from '../api';

export default function QuestionPanel({ question, currentIndex, totalQuestions, answer, sessionId, onAnswer, onNext, onPrev }) {
  if (!question) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Question header */}
      <div className="px-6 py-3 border-b border-ink-800 flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-mono px-2 py-0.5 rounded font-medium ${question.section === 'C' ? 'bg-blue-600/20 text-blue-400 border border-blue-700' : 'bg-emerald-700/20 text-emerald-400 border border-emerald-800'}`}>
          {question.section === 'C' ? 'Section A — C' : 'Section B — Python'}
        </span>
        <span className="text-xs text-ink-500">{question.type === 'mcq' ? 'MCQ · 1 mark' : 'Coding · 2 marks'}</span>
        <span className="ml-auto text-ink-500 text-xs">Q {question.number} of {totalQuestions}</span>
      </div>

      {/* Question body */}
      <div className="flex-1 overflow-hidden">
        {question.type === 'mcq' ? (
          <MCQQuestion question={question} answer={answer} onAnswer={onAnswer} />
        ) : (
          <CodingQuestion question={question} answer={answer} sessionId={sessionId} onAnswer={onAnswer} />
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 py-3 border-t border-ink-800 flex items-center justify-between flex-shrink-0">
        <button
          className="btn-secondary"
          disabled={currentIndex === 0}
          onClick={onPrev}
        >
          ← Previous
        </button>
        <div className="flex gap-2">
          {question.type === 'mcq' && answer !== undefined && (
            <span className="text-emerald-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Saved
            </span>
          )}
        </div>
        <button
          className="btn-primary"
          disabled={currentIndex === totalQuestions - 1}
          onClick={onNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── MCQ Component ──────────────────────────
function MCQQuestion({ question, answer, onAnswer }) {
  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <p className="text-ink-100 text-base leading-relaxed mb-6 whitespace-pre-wrap font-medium">{question.question}</p>
      <div className="space-y-3 max-w-xl">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
              answer === i
                ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                : 'bg-ink-800 border-ink-700 text-ink-300 hover:border-ink-500 hover:bg-ink-700'
            }`}
          >
            <span className={`font-mono mr-3 font-semibold ${answer === i ? 'text-amber-400' : 'text-ink-500'}`}>
              {String.fromCharCode(65 + i)}.
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Coding Component ──────────────────────
function CodingQuestion({ question, answer, sessionId, onAnswer }) {
  const [code, setCode] = useState(answer || question.starterCode || '');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState(question.sampleInput || '');

  useEffect(() => {
    setCode(answer || question.starterCode || '');
    setOutput('');
    setTestResults(null);
    setCustomInput(question.sampleInput || '');
  }, [question.id]);

  const handleRun = async () => {
    setRunning(true);
    setOutput('Running...');
    try {
      const { data } = await runCode(sessionId, {
        questionId: question.id,
        code,
        language: question.language,
        input: customInput
      });
      setOutput(data.output || (data.error ? '(error)' : '(no output)'));
    } catch (err) {
      setOutput('Execution error: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    onAnswer(code); // save code as answer
    try {
      const { data } = await submitCode(sessionId, {
        questionId: question.id,
        code,
        language: question.language
      });
      setTestResults(data);
    } catch (err) {
      setOutput('Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const monacoLang = question.language === 'c' ? 'c' : 'python';

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Problem statement */}
      <div className="w-80 flex-shrink-0 border-r border-ink-800 overflow-y-auto p-4">
        <p className="text-ink-200 text-sm leading-relaxed whitespace-pre-wrap mb-4">{question.question}</p>

        <div className="bg-ink-800 rounded-lg p-3 mb-3">
          <p className="text-xs text-ink-500 font-mono mb-1 uppercase tracking-wide">Sample Input</p>
          <pre className="text-amber-300 text-xs font-mono whitespace-pre-wrap">{question.sampleInput}</pre>
        </div>
        <div className="bg-ink-800 rounded-lg p-3">
          <p className="text-xs text-ink-500 font-mono mb-1 uppercase tracking-wide">Expected Output</p>
          <pre className="text-emerald-300 text-xs font-mono whitespace-pre-wrap">{question.sampleOutput}</pre>
        </div>

        {/* Test results */}
        {testResults && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-mono text-ink-400 uppercase tracking-wide mb-2">
              Test Cases: {testResults.passed}/{testResults.total}
            </p>
            {testResults.results.map((r, i) => (
              <div key={i} className={`rounded-lg p-2.5 border text-xs ${r.passed ? 'bg-emerald-900/20 border-emerald-800' : 'bg-red-900/20 border-red-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{r.passed ? '✅' : '❌'}</span>
                  <span className={`font-semibold ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    Test {i + 1}: {r.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div className="font-mono text-ink-500 space-y-0.5">
                  <p><span className="text-ink-600">In:</span> {r.input.replace(/\n/g, '↵')}</p>
                  <p><span className="text-ink-600">Expected:</span> <span className="text-emerald-400">{r.expected}</span></p>
                  <p><span className="text-ink-600">Got:</span> <span className={r.passed ? 'text-emerald-400' : 'text-red-400'}>{r.output || '(no output)'}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Editor + output */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={monacoLang}
            value={code}
            onChange={(val) => { setCode(val || ''); onAnswer(val); }}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              fontFamily: '"JetBrains Mono", monospace',
              fontLigatures: true,
              lineNumbersMinChars: 3,
            }}
          />
        </div>

        {/* Bottom panel */}
        <div className="border-t border-ink-800 bg-ink-950 flex-shrink-0" style={{ height: '180px' }}>
          <div className="flex h-full">
            {/* Input */}
            <div className="w-40 border-r border-ink-800 p-3 flex flex-col">
              <p className="text-xs text-ink-500 font-mono mb-1.5 uppercase">Input</p>
              <textarea
                className="flex-1 bg-ink-900 border border-ink-700 rounded text-xs font-mono text-ink-300 p-2 resize-none focus:outline-none focus:border-amber-600"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="stdin..."
              />
            </div>

            {/* Output */}
            <div className="flex-1 p-3 flex flex-col overflow-hidden">
              <p className="text-xs text-ink-500 font-mono mb-1.5 uppercase">Output</p>
              <pre className="flex-1 bg-ink-900 border border-ink-700 rounded text-xs font-mono text-emerald-300 p-2 overflow-auto whitespace-pre-wrap">
                {output || <span className="text-ink-600">Click Run to see output...</span>}
              </pre>
            </div>

            {/* Buttons */}
            <div className="flex flex-col justify-center gap-2 p-3 border-l border-ink-800 w-28">
              <button
                className="btn-secondary text-xs py-2"
                onClick={handleRun}
                disabled={running || submitting}
              >
                {running ? '⏳ Running' : '▶ Run'}
              </button>
              <button
                className="btn-primary text-xs py-2"
                onClick={handleSubmit}
                disabled={running || submitting}
              >
                {submitting ? 'Testing...' : '⚡ Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
