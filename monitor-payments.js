/**
 * Payment Monitor — polls USDC transfers to our wallet on Base
 * Run: node monitor-payments.js
 * 
 * Checks for incoming USDC payments every 60 seconds.
 * Logs all transactions to payments-log.json
 */

const https = require('https');

const WALLET = '0x7B8401b5B4ee319aa47DC5F12b869e5Be460A9B2';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://base-rpc.publicnode.com',
];

const LOG_FILE = require('path').join(__dirname, 'payments-log.json');
const CHECK_INTERVAL = 60000; // 60 seconds

// Load existing log
let payments = [];
try {
  payments = require('./payments-log.json');
} catch (e) {
  payments = [];
}

function rpcCall(url, method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function checkPayments() {
  for (const rpc of RPC_URLS) {
    try {
      // Get latest block
      const blockResp = await rpcCall(rpc, 'eth_blockNumber', []);
      if (blockResp.error) continue;
      const latestBlock = parseInt(blockResp.result, 16);
      
      // Check from 1000 blocks ago (~20 minutes)
      const fromBlock = '0x' + (latestBlock - 10000).toString(16);
      
      // Get USDC Transfer events to our wallet
      // Transfer(address,address,uint256) = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
      // topic[2] = padded wallet address
      const paddedWallet = '0x000000000000000000000000' + WALLET.toLowerCase().slice(2);
      
      const logsResp = await rpcCall(rpc, 'eth_getLogs', [{
        address: USDC_CONTRACT,
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          null, // from (any)
          paddedWallet, // to (our wallet)
        ],
        fromBlock,
        toBlock: 'latest',
      }]);
      
      if (logsResp.error) {
        console.log(`RPC error on ${rpc}: ${logsResp.error.message}`);
        continue;
      }
      
      const logs = logsResp.result || [];
      if (logs.length > 0) {
        for (const log of logs) {
          const txHash = log.transactionHash;
          const amount = parseInt(log.data, 16) / 1e6; // USDC has 6 decimals
          const blockNumber = parseInt(log.blockNumber, 16);
          
          // Check if already logged
          if (payments.find(p => p.txHash === txHash)) continue;
          
          const payment = {
            txHash,
            amount: amount.toFixed(6),
            currency: 'USDC',
            network: 'base',
            wallet: WALLET,
            blockNumber,
            timestamp: new Date().toISOString(),
            contract: USDC_CONTRACT,
          };
          
          payments.push(payment);
          
          // Save log
          require('fs').writeFileSync(LOG_FILE, JSON.stringify(payments, null, 2));
          
          // Alert
          console.log('\n' + '='.repeat(60));
          console.log(`💰 PAYMENT RECEIVED!`);
          console.log(`   Amount: $${amount.toFixed(6)} USDC`);
          console.log(`   TX: ${txHash}`);
          console.log(`   Block: ${blockNumber}`);
          console.log(`   Time: ${payment.timestamp}`);
          console.log('='.repeat(60) + '\n');
        }
      }
      
      // Also check ETH transfers
      const txResp = await rpcCall(rpc, 'eth_getTransactionByAddress', [WALLET]);
      
      const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const progress = Math.min(100, (total / 50000) * 100);
      const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
      
      process.stdout.write(`\r[${bar}] ${progress.toFixed(2)}% — $${total.toFixed(2)} / $50,000 | Payments: ${payments.length} | Last check: ${new Date().toLocaleTimeString()}`);
      
      return; // Success, don't try other RPCs
    } catch (e) {
      console.log(`\nRPC failed: ${rpc} - ${e.message}`);
    }
  }
}

console.log('🔍 Payment Monitor Started');
console.log(`   Wallet: ${WALLET}`);
console.log(`   Network: Base (eip155:8453)`);
console.log(`   Token: USDC (${USDC_CONTRACT})`);
console.log(`   Check interval: ${CHECK_INTERVAL / 1000}s`);
console.log(`   Log file: ${LOG_FILE}`);
console.log('='.repeat(60));

// Initial check
checkPayments();

// Periodic check
setInterval(checkPayments, CHECK_INTERVAL);
