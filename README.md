# AfaAgent x402 API Suite

**43 production-grade APIs** — all pay-per-call via x402 protocol with USDC on Base network.

Built for AI agents, autonomous systems, and developers who need instant API access without subscriptions or API keys.

## ✨ Features

- **43 endpoints** across 7 categories
- **x402 v2 compliant** — instant payment, no accounts, no API keys
- **MCP server** — use directly from Claude Desktop, Cursor, Cline
- **Global edge deployment** on Cloudflare Workers — < 50ms latency
- **OpenAPI 3.0 spec** with `x-payment-info` extensions
- **AI-agent optimized** — `llms.txt`, `agents.json`, `.well-known/x402`

## 📊 Service Categories

| Category | Services | Price Range |
|---|---|---|
| 🔗 Blockchain & DeFi | 16 | $0.03 — $19.99 |
| 🤖 AI & ML Tools | 9 | $0.02 — $0.15 |
| 🔧 Developer Tools | 14 | $0.01 — $0.10 |
| 📈 Marketing & SEO | 4 | $0.08 — $0.15 |

### 🔥 Premium Services (High-Margin)

| Service | Price | Description |
|---|---|---|
| `defi-strategy` | $19.99 | Personalized DeFi yield farming strategy with risk assessment |
| `portfolio-rebalancer` | $14.99 | Optimal crypto portfolio allocation across tokens and protocols |
| `smart-contract-audit` | $9.99 | Smart contract security audit — detect vulnerabilities |
| `token-launch-analysis` | $7.99 | Evaluate tokenomics, team, risks, and potential |
| `rug-detect` | $4.99 | Rug pull detector — analyze any token for scam risk |

## 🚀 Quick Start

### Base URL
```
https://afaagent-x402-api.storm-fly.workers.dev
```

### Try it
```bash
curl -X POST https://afaagent-x402-api.storm-fly.workers.dev/api/v1/wallet-risk \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0"}'
```
Returns `402 Payment Required` with payment details.

### How it works
1. Send a POST request to any endpoint
2. Receive `402 Payment Required` with USDC payment details
3. Send the specified USDC amount on Base to the wallet address
4. Resend the request with `X-Payment: <tx_hash>` header

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client / AI Agent                  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Cloudflare Worker (Edge)                │
│  • 43 API endpoints                                  │
│  • x402 v2 payment middleware                        │
│  • MCP server (/mcp)                                 │
│  • OpenAPI spec + discovery docs                     │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Blockchain (Base / USDC)                 │
│  • On-chain payment verification                      │
│  • USDC ERC-20 token                                  │
└─────────────────────────────────────────────────────┘
```

## 📡 Discovery Endpoints

- `/.well-known/x402` — x402 service discovery
- `/openapi.json` — OpenAPI 3.0 spec with payment info
- `/llms.txt` — LLM-friendly API documentation
- `/agents.json` — AI agent manifest
- `/mcp` — MCP server endpoint (Streamable HTTP)
- `/health` — Health check

## 🧩 MCP Integration

Use as an MCP server in Claude Desktop, Cursor, Cline, or any MCP-compatible agent:

```json
{
  "mcpServers": {
    "afaagent-x402": {
      "transport": "streamableHttp",
      "url": "https://afaagent-x402-api.storm-fly.workers.dev/mcp"
    }
  }
}
```

All 43 tools are available as MCP tools with inline pricing info.

## 💰 Payment Details

- **Network**: Base (eip155:8453)
- **Token**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Wallet**: `0x7B8401b5B4ee319aa47DC5F12b869e5Be460A9B2`
- **Decimals**: 6

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run local server
npm start

# Deploy to Cloudflare Workers
npx wrangler deploy
```

## 📁 Project Structure

```
x402-api-services/
├── server.js          # Express server (local dev)
├── worker.js          # Cloudflare Worker (production)
├── service-meta.js    # Service metadata (schemas, examples)
├── wrangler.toml      # Cloudflare Workers config
├── register-x402scan.js  # x402scan registration script
├── check-balance.js   # Wallet balance checker
├── generate-service.js # Service generator CLI
└── docs/              # GitHub Pages static files
```

## 🤝 Contact

- **Author**: AfaAgent
- **GitHub**: [@AfaAgent](https://github.com/AfaAgent)
- **Wallet**: `0x7B8401b5B4ee319aa47DC5F12b869e5Be460A9B2`

## 📜 License

MIT
