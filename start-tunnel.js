const { exec, spawn } = require('child_process');
const path = require('path');

const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, PORT: 3000 }
});

serverProcess.on('error', (err) => {
  console.error('Server error:', err);
});

setTimeout(() => {
  const lt = spawn('lt', ['--port', '3000', '--subdomain', 'afaagent-x402'], {
    stdio: 'inherit',
    env: process.env
  });
  
  lt.on('error', (err) => {
    console.error('Localtunnel error:', err);
  });
  
  lt.on('close', (code) => {
    console.log('Localtunnel exited with code', code);
  });
}, 2000);

process.on('SIGINT', () => {
  serverProcess.kill();
  process.exit(0);
});
