// @ts-nocheck
import { execSync } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';

export default function (cmd) {
  const wavPath = join(homedir(), '.commandcode', 'mods', 'anya_say_chichi.wav');

  cmd.on('run_end', () => {
    const psCmd = `(New-Object System.Media.SoundPlayer '${wavPath}').PlaySync()`;
    execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'ignore' });
  });
}
