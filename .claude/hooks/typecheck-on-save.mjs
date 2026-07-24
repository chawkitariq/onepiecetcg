import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    filePath = JSON.parse(raw)?.tool_input?.file_path ?? '';
  } catch {
    process.exit(0);
  }

  let pkg = null;
  if (/\/packages\/api\/.*\.ts$/.test(filePath)) pkg = 'api';
  else if (/\/packages\/web\/.*\.(vue|ts)$/.test(filePath)) pkg = 'web';
  else if (/\/packages\/shared\/.*\.ts$/.test(filePath)) pkg = 'shared';
  if (!pkg) process.exit(0);

  try {
    execFileSync('pnpm', ['--dir', `packages/${pkg}`, 'typecheck'], { cwd: repoRoot, stdio: 'pipe' });
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.slice(0, 4000);
    console.log(
      JSON.stringify({
        decision: 'block',
        reason: `typecheck failed in packages/${pkg}:\n${output}`,
      }),
    );
  }
});
