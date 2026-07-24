let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    filePath = JSON.parse(raw)?.tool_input?.file_path ?? '';
  } catch {
    process.exit(0);
  }

  const isEnvFile = /(^|\/)\.env(\..+)?$/.test(filePath);
  const isExample = filePath.endsWith('.env.example');
  if (!isEnvFile || isExample) process.exit(0);

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Editing .env files is blocked to avoid committing secrets. Edit .env.example instead.',
      },
    }),
  );
});
