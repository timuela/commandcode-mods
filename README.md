# completion-bell

CommandCode mod that plays a WAV sound file (`anya_say_chichi.wav`) whenever a response finishes.

It hooks into the `run_end` event using the ModApi's observer, and uses PowerShell's `System.Media.SoundPlayer` to play the audio synchronously.

## Install

### 1. npm (recommended)

```bash
cmd mods add npm:cmd-mod-completion-bell -g
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

## Notes

- **Windows-only** — relies on PowerShell's `System.Media.SoundPlayer`.
- Every time a response finishes, you'll hear Anya calling you (from Spy x Family).

### More on mods: https://commandcode.ai/docs/mods