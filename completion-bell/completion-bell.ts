// @ts-nocheck
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Permission modes where a tool call pauses for the user before it runs.
// 'bypass' and 'dont-ask' auto-approve everything, so the bell would be noise.
const PROMPTING_MODES = new Set(['default', 'plan', 'auto-accept']);

export default function (cmd) {
  const wavPath = join(__dirname, 'anya_say_chichi.wav');
  let permissionMode = 'default'; // updated on permission_mode_changed
  let lastPromptBell = 0;

  const playBell = () => {
    const psCmd = `(New-Object System.Media.SoundPlayer '${wavPath}').PlaySync()`;
    exec(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'ignore' });
  };

  // A turn usually queues several tools at once — ring once per batch.
  const ringForPrompt = () => {
    const now = Date.now();
    if (now - lastPromptBell < 800) return;
    lastPromptBell = now;
    playBell();
  };

  cmd.on('permission_mode_changed', ({ mode }) => {
    permissionMode = mode;
  });

  // tool_queued fires just before the permission check — the approval modal
  // appears right after in prompting modes, and ask_user_question always
  // waits on an answer, so ring regardless of mode for it.
  cmd.on('tool_queued', ({ toolName }) => {
    if (toolName === 'ask_user_question' || PROMPTING_MODES.has(permissionMode)) {
      ringForPrompt();
    }
  });

  cmd.on('run_error', () => {
    playBell();
  });

  cmd.on('run_end', () => {
    playBell();
  });
}
