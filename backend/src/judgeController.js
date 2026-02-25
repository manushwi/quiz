const { executeCode } = require("./localRunner");
const questions = require("./questions");

function normalize(str) {
  return (str || "")
    .trim()
    .replace(/\r/g, "")
    .split("\n")
    .map(l => l.trim())
    .join("\n");
}

async function judgeQuestion(questionId, language, code) {

  const problem = questions.find(q => q.id === questionId);
  const testCases = problem.testCases;

  let passed = 0;
  const results = [];

  for (const tc of testCases) {

    const result = await executeCode(language, code, tc.input);

    const ok = !result.error &&
      normalize(result.output) === normalize(tc.expected);

    if (ok) passed++;

    results.push({
      input: tc.input,
      expected: tc.expected,
      output: result.output,
      passed: ok
    });
  }

  return {
    total: testCases.length,
    passed,
    score: passed * 2,
    results
  };
}

module.exports = { judgeQuestion };