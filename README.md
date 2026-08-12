# completion-bell

CommandCode mod that plays a WAV sound file (`anya_say_chichi.wav`) whenever the assistant needs your attention.

It hooks the ModApi event stream and rings for:

- **Permission prompts** — when a tool call sits on an approval modal for ~5 seconds without being approved or denied, it means you're away — the bell rings to pull you back. If you're already watching and approve, you never hear it.
- **Questions & approvals** — the assistant calls `ask_user_question`, or decides to present a plan for approval (`enter_plan_mode`, `exit_plan_mode`, `plan_review`). The bell rings the moment the model requests one of these (via `message_end` tool_use detection), in any permission mode.
- **Conversation end** — a response finishes (`run_end`).
- **Errors** — a run fails (`run_error`).

Sound playback uses PowerShell's `System.Media.SoundPlayer`, fired asynchronously so it never blocks the agent loop.

## Install

### 1. npm (recommended)

```bash
cmdc mods add npm:cmd-mod-completion-bell -g
```

### 2. Or Manually

1. Save `completion-bell.ts` and `anya_say_chichi.wav` to `~/.commandcode/mods/` (global) or `<project>/.commandcode/mods/` (project-level)

Restart CommandCode — it auto-loads on next session

You can also test immediately without restarting:

```bash
cmdc --mod completion-bell.ts
```

### Swap the sound

Replace `anya_say_chichi.wav` with any `.wav` file — just keep the same filename (or update the constant in `completion-bell.ts`).

### Quiet in auto-approve modes

In `bypass` / `dont-ask` permission modes nothing prompts, so the bell never rings for tool calls — only for questions, completion, and errors.

### Tuning the prompt-detection window

The permission-prompt bell rings after a queued tool has gone ~5 seconds without starting (or being denied). You can adjust this in `completion-bell.ts` via the `PENDING_CHECK_MS` constant — raise it to be more forgiving, lower it to catch prompts faster.

## Notes

- **Windows-only** — relies on PowerShell's `System.Media.SoundPlayer`.
- Every time Command Code needs you — a permission prompt, a question, or a finished response — you'll hear Anya calling you (from Spy x Family).

### More on mods: https://commandcode.ai/docs/mods