const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  localPort: 3000,
  tunnels: [
    { name: 'serveo', cmd: 'ssh', args: ['-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:3000', 'serveo.net'], urlPattern: /https:\/\/[\w-]+\.serveo\.net/ },
    { name: 'localtunnel', cmd: 'npx', args: ['localtunnel', '--port', '3000', '--subdomain', 'afaagent-x402'], urlPattern: /https:\/\/[\w-]+\.loca\.lt/ }
  ],
  healthCheck: {
    interval: 30000,
    timeout: 10000,
    path: '/api/v1/health'
  },
  statusFile: path.join(__dirname, 'tunnel-status.json')
};

const activeTunnels = new Map();

function checkHealth(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), CONFIG.healthCheck.timeout);
    const parsedUrl = new URL(url + CONFIG.healthCheck.path);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const req = lib.get(parsedUrl, (res) => {
      clearTimeout(timeout);
      resolve(res.statusCode === 200);
    });
    req.on('error', () => { clearTimeout(timeout); resolve(false); });
  });
}

function startTunnel(tunnelConfig) {
  console.log(`[${tunnelConfig.name}] Starting tunnel...`);
  
  const child = spawn(tunnelConfig.cmd, tunnelConfig.args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  let url = null;
  let buffer = '';

  const onOutput = (data) => {
    buffer += data.toString();
    const match = buffer.match(tunnelConfig.urlPattern);
    if (match && !url) {
      url = match[0];
      console.log(`[${tunnelConfig.name}] Tunnel URL: ${url}`);
      activeTunnels.set(tunnelConfig.name, { url, child, since: Date.now() });
      saveStatus();
    }
  };

  child.stdout.on('data', onOutput);
  child.stderr.on('data', onOutput);

  child.on('close', (code) => {
    console.log(`[${tunnelConfig.name}] Tunnel exited with code ${code}`);
    activeTunnels.delete(tunnelConfig.name);
    saveStatus();
    setTimeout(() => startTunnel(tunnelConfig), 5000);
  });

  child.on('error', (err) => {
    console.log(`[${tunnelConfig.name}] Tunnel error: ${err.message}`);
    setTimeout(() => startTunnel(tunnelConfig), 10000);
  });
}

function saveStatus() {
  const status = {
    updated: Date.now(),
    tunnels: Array.from(activeTunnels.entries()).map(([name, info]) => ({
      name,
      url: info.url,
      since: info.since
    }))
  };
  fs.writeFileSync(CONFIG.statusFile, JSON.stringify(status, null, 2));
}

async function healthCheckLoop() {
  for (const [name, info] of activeTunnels) {
    if (info.url) {
      const healthy = await checkHealth(info.url);
      console.log(`[health] ${name}: ${healthy ? 'OK' : 'FAIL'} - ${info.url}`);
      if (!healthy) {
        console.log(`[health] Restarting ${name}...`);
        info.child.kill('SIGTERM');
      }
    }
  }
}

function startServer() {
  console.log('Starting tunnel monitor...');
  
  CONFIG.tunnels.forEach(tunnel => startTunnel(tunnel));
  
  setInterval(healthCheckLoop, CONFIG.healthCheck.interval);
  
  console.log('Tunnel monitor started. Status file:', CONFIG.statusFile);
}

startServer();
