# What this is:

  ## completion-bell:
  Command Code mods that plays a WAV sound file (`anya_say_chichi.wav`) whenever a command finishes.

  It hooks into the run_end event using the ModApi'sobserver, and uses PowerShell's System.Media.SoundPlayer to play the audio synchronously.

  ### How to install and use:

  1. Save the `.ts` file as `~/.commandcode/mods/completion-bell.ts` (personal) or
  `<project>/.commandcode/mods/completion-bell.ts` (project-level)
  2. Place the WAV file (`anya_say_chichi.wav`) in the same directory
  3. Restart CommandCode — it auto-loads on next session
  4. Every time a response finishes, you'll hear Anya calling you.

  You can also test it immediately without restarting:

  ``cmdc --mod completion-bell.ts``

  The WAV file (Anya's "chichi" from Spy x Family) can be swapped for any .wav — just change the filename in `completion-bell.ts`

  Also this is Windows-only because of the PowerShell SoundPlayer call.

# More info on how to mod: https://commandcode.ai/docs/mods