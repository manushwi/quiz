const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '..', 'temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function runCommand(command, args, input, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let completed = false;
    let timer = null;

    const child = spawn(command, args);

    timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        child.kill();
        resolve({ success: false, output: '', error: 'Time Limit Exceeded' });
      }
    }, timeoutMs);

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        if (code === 0) {
          resolve({ success: true, output: stdout.trim(), error: null });
        } else {
          resolve({ success: false, output: stdout.trim(), error: stderr.trim() || 'Runtime Error' });
        }
      }
    });

    child.on('error', (err) => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        resolve({ success: false, output: '', error: err.message });
      }
    });
  });
}

async function executeCode(language, code, input) {
  const jobId = uuidv4();
  const fileName = language === 'c' ? `${jobId}.c` : `${jobId}.py`;
  const filePath = path.join(TEMP_DIR, fileName);
  const exeName = process.platform === 'win32' ? `${jobId}.exe` : jobId;
  const exePath = path.join(TEMP_DIR, exeName);

  try {
    fs.writeFileSync(filePath, code);

    if (language === 'c') {
      // Compile C
      // gcc file.c -o file.exe
      const compileRes = await runCommand('gcc', [filePath, '-o', exePath], null, 5000);
      
      if (!compileRes.success) {
        // Cleanup source file
        try { fs.unlinkSync(filePath); } catch (e) {}
        return { success: false, output: '', error: compileRes.error };
      }

      // Run Executable
      const runRes = await runCommand(exePath, [], input, 2000); // 2s execution timeout

      // Cleanup
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
      } catch (e) {}

      return runRes;

    } else if (language === 'python') {
      // Run Python
      // Try 'python3' (Linux/Docker) or 'python' (Windows/Local)
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const runRes = await runCommand(pythonCmd, [filePath], input, 5000);
      
      // Cleanup
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {}

      return runRes;

    } else {
      return { success: false, output: '', error: 'Unsupported language' };
    }
  } catch (err) {
    return { success: false, output: '', error: err.message };
  }
}

module.exports = { executeCode };
