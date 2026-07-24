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
  if (!pkg) process.exit(0);

  const relativePath = path.relative(path.join(repoRoot, 'packages', pkg), filePath);

  try {
    execFileSync('pnpm', ['exec', 'eslint', '--fix', relativePath], {
      cwd: path.join(repoRoot, 'packages', pkg),
      stdio: 'pipe',
    });
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.slice(0, 4000);
    console.log(
      JSON.stringify({
        decision: 'block',
        reason: `lint failed in packages/${pkg} for ${relativePath}:\n${output}`,
      }),
    );
  }
});
