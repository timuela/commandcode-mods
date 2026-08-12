// @ts-nocheck
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tools that block on the user — the bell rings the moment the model calls them.
const USER_BLOCKING_TOOLS = new Set([
  'ask_user_question',
  'enter_plan_mode',
  'exit_plan_mode',
  'plan_review',
]);

// Modes where a tool call can pause for a permission prompt.
const PROMPTING_MODES = new Set(['default', 'plan', 'auto-accept']);

// Ring if a queued tool sits unanswered this long (you're away);
// approve fast and the bell stays quiet.
const PENDING_MS = 5000;
const DEBOUNCE_MS = 2000; // at most one bell per window

export default function (cmd) {
  const wavPath = join(__dirname, 'anya_say_chichi.wav');
  const pending = new Map(); // toolCallId -> timeout
  let permissionMode = 'default';
  let lastRingAt = 0;

  const playBell = () => {
    const escapedPath = wavPath.replace(/'/g, "''");
    const psCmd = `(New-Object System.Media.SoundPlayer '${escapedPath}').PlaySync()`;
    spawn('powershell', ['-NoProfile', '-Command', psCmd], { stdio: 'ignore', windowsHide: true });
  };

  const ring = () => {
    const now = Date.now();
    if (now - lastRingAt < DEBOUNCE_MS) return;
    lastRingAt = now;
    playBell();
  };

  const clearPending = (id) => {
    const timer = pending.get(id);
    if (timer) clearTimeout(timer);
    pending.delete(id);
  };

  const clearAllPending = () => {
    for (const timer of pending.values()) clearTimeout(timer);
    pending.clear();
  };

  cmd.on('permission_mode_changed', ({ mode }) => {
    permissionMode = mode;
  });

  // Plan approval and question tools fire no tool events (their panels are
  // TUI-side), so detect the tool_use in the finished message and ring now.
  cmd.on('message_end', ({ content }) => {
    const requested = (content ?? []).some(
      (b) => b?.type === 'tool_use' && USER_BLOCKING_TOOLS.has(b.name)
    );
    if (requested) ring();
  });

  // A queued tool that never starts means a permission prompt is waiting on
  // you — ring once after the window. Fast approvals never ring.
  cmd.on('tool_queued', ({ toolCallId, toolName }) => {
    if (!PROMPTING_MODES.has(permissionMode)) return;
    if (USER_BLOCKING_TOOLS.has(toolName)) return;
    pending.set(
      toolCallId,
      setTimeout(() => {
        pending.delete(toolCallId);
        ring();
      }, PENDING_MS)
    );
  });

  // The tool started or was denied — nothing is waiting on it anymore.
  cmd.on('tool_running', ({ toolCallId }) => clearPending(toolCallId));
  cmd.on('tool_denied', ({ toolCallId }) => clearPending(toolCallId));
  cmd.on('interrupted', clearAllPending);

  cmd.on('run_end', () => {
    clearAllPending();
    ring();
  });
  cmd.on('run_error', () => {
    clearAllPending();
    ring();
  });
}
