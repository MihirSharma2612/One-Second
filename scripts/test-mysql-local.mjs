import { mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'node:net';

// Disposable test server only. Never opens or migrates the user's existing databases.
const directory = await mkdtemp('/private/tmp/one-second-mysql-');
const port = 33307;
const databaseUrl = `mysql://root@127.0.0.1:${port}/one_second_test`;
const env = { ...process.env, DATABASE_URL: databaseUrl, CATALOG_SOURCE: 'database' };
let server;
let stopped = false;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
  });
}

try {
  await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(port, '127.0.0.1', () => probe.close(resolve));
  });
  await run('mysqld', ['--no-defaults', '--initialize-insecure', `--datadir=${directory}`]);
  server = spawn('mysqld', ['--no-defaults', `--datadir=${directory}`, '--bind-address=127.0.0.1',
    `--port=${port}`, `--socket=${directory}/mysql.sock`, '--mysqlx=OFF'], { stdio: 'inherit' });
  let startError;
  server.once('error', error => { startError = error; stopped = true; });
  server.once('exit', () => { stopped = true; });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (stopped) throw startError ?? new Error('Test MySQL exited before readiness');
    try {
      await run('mysqladmin', ['--no-defaults', '-h', '127.0.0.1', '-P', String(port), '-u', 'root', 'ping']);
      ready = true;
      break;
    } catch { await delay(500); }
  }
  if (!ready) throw new Error('Test MySQL did not become ready');
  await run('mysql', ['--no-defaults', '-h', '127.0.0.1', '-P', String(port), '-u', 'root',
    '-e', 'CREATE DATABASE one_second_test']);
  for (const script of ['db:validate', 'db:generate', 'db:migrate', 'db:migrate', 'db:seed', 'db:seed', 'test:database', 'check']) {
    await run('npm', ['run', script]);
  }
} finally {
  if (server && !stopped && server.pid) {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill('SIGTERM');
    await Promise.race([exited, delay(15000)]);
  }
  if (!server || stopped) {
    // directory is exclusively the mkdtemp-created test database, never user data.
    await rm(directory, { recursive: true, force: true });
  } else {
    console.warn(`MySQL has not stopped; test files preserved at ${directory}`);
  }
}
