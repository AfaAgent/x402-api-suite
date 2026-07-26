const fs = require('fs');
const path = require('path');

const WALLET = '0x7B8401b5B4ee319aa47DC5F12b869e5Be460A9B2';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RPC_ENDPOINTS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://base.meowrpc.com',
];

async function callRPC(method, params, rpcIndex = 0) {
  try {
    const response = await fetch(RPC_ENDPOINTS[rpcIndex], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      timeout: 10000,
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  } catch (err) {
    if (rpcIndex < RPC_ENDPOINTS.length - 1) {
      return callRPC(method, params, rpcIndex + 1);
    }
    throw err;
  }
}

function hexToNumber(hex) {
  return parseInt(hex, 16);
}

function formatUSDC(rawBalance) {
  const balance = BigInt(rawBalance);
  const decimals = 6;
  const whole = balance / BigInt(10 ** decimals);
  const frac = balance % BigInt(10 ** decimals);
  return `${whole}.${frac.toString().padStart(decimals, '0').slice(0, decimals)}`;
}

async function getUSDCBalance() {
  const data = '0x70a08231000000000000000000000000' + WALLET.slice(2).toLowerCase();
  const result = await callRPC('eth_call', [{
    to: USDC_CONTRACT,
    data: data,
  }, 'latest']);
  return formatUSDC(result);
}

async function getETHBalance() {
  const result = await callRPC('eth_getBalance', [WALLET, 'latest']);
  const balance = BigInt(result);
  const eth = Number(balance) / 1e18;
  return eth.toFixed(6);
}

async function main() {
  try {
    const usdc = await getUSDCBalance();
    const eth = await getETHBalance();

    const logEntry = {
      timestamp: new Date().toISOString(),
      wallet: WALLET,
      network: 'Base',
      usdc_balance: usdc,
      eth_balance: eth,
    };

    const logFile = path.join(__dirname, 'balance-log.jsonl');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    console.log('=== BALANCE REPORT ===');
    console.log(`Wallet: ${WALLET}`);
    console.log(`Network: Base (eip155:8453)`);
    console.log(`USDC: ${usdc}`);
    console.log(`ETH:  ${eth}`);
    console.log(`Logged to: ${logFile}`);

    return logEntry;
  } catch (err) {
    console.error('Error checking balance:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getUSDCBalance, getETHBalance, WALLET };
