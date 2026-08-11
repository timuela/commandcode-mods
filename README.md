# completion-bell

CommandCode mod that plays a WAV sound file (`anya_say_chichi.wav`) whenever the assistant needs your attention.

It hooks the ModApi event stream and rings for:

- **Permission prompts** — a tool call is queued and Command Code is about to ask you to approve it (fires on `tool_queued` in prompting modes: `default`, `plan`, `auto-accept`). Multiple tools in one batch ring once.
- **Questions** — the assistant calls `ask_user_question`, so it's waiting on your answer (rings regardless of permission mode).
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

In `bypass` / `dont-ask` permission modes nothing prompts, so the bell doesn't ring for tool calls — only for questions, completion, and errors.

## Notes

- **Windows-only** — relies on PowerShell's `System.Media.SoundPlayer`.
- Every time Command Code needs you — a permission prompt, a question, or a finished response — you'll hear Anya calling you (from Spy x Family).

### More on mods: https://commandcode.ai/docs/mods