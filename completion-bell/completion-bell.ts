// @ts-nocheck
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function (cmd) {
  const wavPath = join(__dirname, 'anya_say_chichi.wav');

  cmd.on('run_end', () => {
    const psCmd = `(New-Object System.Media.SoundPlayer '${wavPath}').PlaySync()`;
    execSync(`powershell -NoProfile -Command "${psCmd}"`, { stdio: 'ignore' });
  });
}
