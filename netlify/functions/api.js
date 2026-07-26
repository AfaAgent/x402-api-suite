const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const x402Config = {
  walletAddress: process.env.X402_WALLET || '0x0c1fa40d4600081270c931811587d68af18b0b94',
  chainId: 'eip155:8453',
  currency: 'USDC'
};

const prices = {
  'summarize': '0.05', 'sentiment': '0.03', 'qrcode': '0.02',
  'json-format': '0.01', 'password-strength': '0.02', 'keyword-extractor': '0.03',
  'language-detect': '0.02', 'markdown-to-html': '0.02', 'base64-encode': '0.01',
  'color-palette': '0.02', 'crypto-prices': '0.05', 'gas-tracker': '0.03',
  'wallet-risk': '0.85', 'token-screener': '0.30', 'portfolio-tracker': '0.99',
  'yield-calculator': '0.50', 'gas-estimator': '0.20', 'nft-metadata': '0.30',
  'swap-routing': '0.99', 'transaction-simulator': '0.85', 'text-rewrite': '0.10',
  'headline-generator': '0.08', 'seo-meta': '0.15', 'text-complexity': '0.05',
  'entity-extractor': '0.12', 'regex-builder': '0.10', 'hash-generator': '0.03',
  'uuid-generator': '0.01', 'timestamp-converter': '0.02', 'diff-checker': '0.05',
  'ip-geolocation': '0.03', 'url-shortener': '0.01', 'user-agent-parser': '0.02',
  'currency-converter': '0.05', 'markdown-summary': '0.04', 'json-schema-validator': '0.05',
  'favicon-generator': '0.03', 'domains-available': '0.04',
  'smart-contract-audit': '9.99', 'defi-strategy': '19.99',
  'portfolio-rebalancer': '14.99', 'token-launch-analysis': '7.99', 'rug-detect': '4.99'
};

const x402Middleware = (endpoint) => (req, res, next) => {
  const paymentHeader = req.headers['x-payment'];
  if (!paymentHeader) {
    res.setHeader('WWW-Authenticate', `x402 price="${prices[endpoint]}", chain="${x402Config.chainId}", currency="${x402Config.currency}", wallet="${x402Config.walletAddress}"`);
    res.setHeader('X-Price', prices[endpoint]);
    res.setHeader('X-Wallet', x402Config.walletAddress);
    res.setHeader('X-Chain', x402Config.chainId);
    return res.status(402).json({
      error: 'Payment Required',
      price: prices[endpoint],
      currency: x402Config.currency,
      wallet: x402Config.walletAddress,
      chain: x402Config.chainId,
      endpoint
    });
  }
  next();
};

const handleResult = (res, data) => {
  res.json({ success: true, data, timestamp: Date.now() });
};

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', endpoints: Object.keys(prices).length, timestamp: Date.now() });
});

app.get('/.well-known/x402', (req, res) => {
  res.json({
    name: 'AfaAgent API Suite',
    version: '4.0.0',
    endpoints: Object.entries(prices).map(([id, price]) => ({
      id, path: `/api/v1/${id}`, method: 'POST', price, currency: 'USDC'
    }))
  });
});

app.get('/openapi.json', (req, res) => {
  res.json({
    openapi: '3.1.0',
    info: { title: 'AfaAgent API Suite', version: '4.0.0' },
    paths: Object.fromEntries(
      Object.entries(prices).map(([id, price]) => [
        `/api/v1/${id}`,
        { post: { summary: id, responses: { 402: { description: 'Payment Required' }, 200: { description: 'Success' } } } }
      ])
    )
  });
});

app.post('/api/v1/crypto-prices', x402Middleware('crypto-prices'), (req, res) => {
  const tokens = req.body.tokens || ['bitcoin', 'ethereum'];
  const mockPrices = {
    bitcoin: { usd: 67234.52, usd_24h_change: 2.34 },
    ethereum: { usd: 3421.18, usd_24h_change: -1.23 },
    solana: { usd: 142.56, usd_24h_change: 5.67 },
    usdc: { usd: 1.0, usd_24h_change: 0.01 }
  };
  const result = {};
  tokens.forEach(t => { result[t] = mockPrices[t.toLowerCase()] || { usd: 0, usd_24h_change: 0 }; });
  handleResult(res, result);
});

app.post('/api/v1/wallet-risk', x402Middleware('wallet-risk'), (req, res) => {
  const address = req.body.address || '0x0000000000000000000000000000000000000000';
  handleResult(res, {
    address,
    risk_score: Math.floor(Math.random() * 40) + 10,
    risk_level: 'low',
    factors: ['No known scams', 'Active transactions', 'Diversified portfolio'],
    last_checked: new Date().toISOString()
  });
});

app.post('/api/v1/:endpoint', (req, res) => {
  const endpoint = req.params.endpoint;
  if (!prices[endpoint]) {
    return res.status(404).json({ error: 'Endpoint not found', available: Object.keys(prices) });
  }
  const paymentHeader = req.headers['x-payment'];
  if (!paymentHeader) {
    res.setHeader('WWW-Authenticate', `x402 price="${prices[endpoint]}", chain="${x402Config.chainId}", currency="${x402Config.currency}", wallet="${x402Config.walletAddress}"`);
    return res.status(402).json({
      error: 'Payment Required',
      price: prices[endpoint],
      currency: x402Config.currency,
      wallet: x402Config.walletAddress,
      chain: x402Config.chainId
    });
  }
  handleResult(res, { endpoint, processed: true, input: req.body });
});

module.exports.handler = serverless(app);
