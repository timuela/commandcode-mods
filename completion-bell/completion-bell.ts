// @ts-nocheck
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Permission modes where a tool call pauses for the user before it runs.
// 'bypass' and 'dont-ask' auto-approve everything, so no prompt ever appears.
const PROMPTING_MODES = new Set(['default', 'plan', 'auto-accept']);

// Tools whose execution blocks on the user — the assistant is waiting on an
// answer or an approval right now, so the bell rings instantly, in any mode.
const USER_BLOCKING_TOOLS = new Set([
  'ask_user_question', // question modal
  'enter_plan_mode',   // asks the user to confirm entering plan mode
  'exit_plan_mode',    // asks the user to approve leaving plan mode
  'plan_review',       // plan approval panel (approve / refine)
]);

// If a queued tool hasn't started running within this window, it's almost
// certainly sitting on a permission modal — ring to pull the user back.
// An attentive user approves (and triggers tool_running) well before this.
const PENDING_CHECK_MS = 5000;

// Don't ring more than once per window — a batch of queued tools that all
// time out together should produce a single bell.
const RING_DEBOUNCE_MS = 2000;

export default function (cmd) {
  const wavPath = join(__dirname, 'anya_say_chichi.wav');
  let permissionMode = 'default'; // updated on permission_mode_changed
  let lastRingAt = 0;
  const pending = new Map(); // toolCallId -> timeout handle

  const playBell = () => {
    const psCmd = `(New-Object System.Media.SoundPlayer '${wavPath}').PlaySync()`;
    exec(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'ignore' });
  };

  const ringDebounced = () => {
    const now = Date.now();
    if (now - lastRingAt < RING_DEBOUNCE_MS) return;
    lastRingAt = now;
    playBell();
  };

  const clearPending = (toolCallId) => {
    const timer = pending.get(toolCallId);
    if (timer) {
      clearTimeout(timer);
      pending.delete(toolCallId);
    }
  };

  const clearAllPending = () => {
    for (const timer of pending.values()) clearTimeout(timer);
    pending.clear();
  };

  cmd.on('permission_mode_changed', ({ mode }) => {
    permissionMode = mode;
  });

  // A queued tool that doesn't start means a permission modal is holding the
  // run — the user is away. Ring once if it's still pending after the window.
  // User-blocking tools ring on tool_running instead, so skip them here.
  cmd.on('tool_queued', ({ toolCallId, toolName }) => {
    if (!PROMPTING_MODES.has(permissionMode)) return;
    if (USER_BLOCKING_TOOLS.has(toolName)) return;
    const timer = setTimeout(() => {
      pending.delete(toolCallId);
      ringDebounced();
    }, PENDING_CHECK_MS);
    pending.set(toolCallId, timer);
  });

  // The tool started — either auto-approved or the user already approved, so
  // no permission bell needed. User-blocking tools are the exception: their
  // run blocks on the user (question modal, plan approval), so ring now.
  cmd.on('tool_running', ({ toolCallId, toolName }) => {
    clearPending(toolCallId);
    if (USER_BLOCKING_TOOLS.has(toolName)) ringDebounced();
  });

  // The user denied — they were present, no bell.
  cmd.on('tool_denied', ({ toolCallId }) => {
    clearPending(toolCallId);
  });

  // A run ended or was interrupted — nothing is waiting anymore.
  cmd.on('interrupted', clearAllPending);

  cmd.on('run_error', () => {
    clearAllPending();
    playBell();
  });

  cmd.on('run_end', () => {
    clearAllPending();
    playBell();
  });
}
