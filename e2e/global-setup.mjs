import { execSync } from 'node:child_process';

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Preview server did not respond at ${url} within ${timeoutMs}ms`);
}

export default async function globalSetup() {
  try {
    execSync('npx astro preview stop', { stdio: 'ignore' });
  } catch {
    // no server was running
  }
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npx astro preview', { stdio: 'inherit' });
  await waitForServer('http://localhost:4321/', 15_000);
}
