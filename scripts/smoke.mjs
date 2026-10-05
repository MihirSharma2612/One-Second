import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

// Run only after a successful production build. Use an isolated local port.
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3100'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});
let stopped = false;
let spawnError;
server.once('exit', () => { stopped = true; });
server.once('error', error => { spawnError = error; });
const base = 'http://localhost:3100';

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (spawnError) throw spawnError;
    if (stopped) throw new Error('Production server exited before readiness');
    try {
      const response = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(1000) });
      const health = await response.json();
      if (response.ok && health.service === 'one-second' && health.status === 'ok') {
        ready = true;
        break;
      }
    } catch { /* Allow startup time. */ }
    await delay(500);
  }
  assert.ok(ready, 'Production server did not become ready');
  const routes = [
    ['/', 'TAKE THE'],
    ['/shop', 'THE NEW DROP'],
    ['/shop?category=Tees', 'Afterglow Heavyweight Tee'],
    ['/shop?category=unknown', 'NO RESULTS FOUND'],
    ['/product/static-noise-tee', 'Static Noise Oversized Tee'],
    ['/cart', 'Your bag is empty'],
    ['/checkout', 'Payment is not enabled'],
  ];
  for (const [path, text] of routes) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `${path} response status`);
    assert.ok((await response.text()).includes(text), `${path} missing expected content`);
    console.log(`PASS ${path}`);
  }
  const missing = await fetch(`${base}/not-a-page`, { signal: AbortSignal.timeout(10000) });
  assert.equal(missing.status, 404);
  console.log('PASS 404');
} finally {
  if (!stopped && server.pid) {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM');
    await Promise.race([exited, delay(5000)]);
    if (!stopped) server.kill('SIGKILL');
  }
}
