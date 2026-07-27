# AfaAgent x402 API Suite

**43 production-grade APIs** — all pay-per-call via x402 protocol with USDC on Base network.

Built for AI agents, autonomous systems, and developers who need instant API access without subscriptions or API keys.

## Live Endpoint

**Base URL**: `https://afaagent-x402-api.brazen-rotate.workers.dev`

**Status**: [https://afaagent-x402-api.brazen-rotate.workers.dev/health](https://afaagent-x402-api.brazen-rotate.workers.dev/health)

## Quick Start

```bash
# 1. Try any endpoint (returns 402 with payment details)
curl -X POST https://afaagent-x402-api.brazen-rotate.workers.dev/api/v1/wallet-risk \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0"}'

# 2. Pay the USDC amount on Base to the wallet shown
# 3. Resend with the X-Payment header
curl -X POST https://afaagent-x402-api.brazen-rotate.workers.dev/api/v1/wallet-risk \
  -H "Content-Type: application/json" \
  -H "X-Payment: <tx_hash>" \
  -d '{"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0"}'
```

## Service Categories (43 services)

| Category | Services | Price Range |
|---|---|---|
| Blockchain & DeFi | 16 | $0.03 — $19.99 |
| AI & ML Tools | 9 | $0.02 — $0.15 |
| Developer Tools | 14 | $0.01 — $0.10 |
| Marketing & SEO | 4 | $0.08 — $0.15 |

### Premium Services (High-Margin)

| Service | Price | Description |
|---|---|---|
| `defi-strategy` | $19.99 | Personalized DeFi yield farming strategy with risk assessment |
| `portfolio-rebalancer` | $14.99 | Optimal crypto portfolio allocation across tokens and protocols |
| `smart-contract-audit` | $9.99 | Smart contract security audit — detect vulnerabilities |
| `token-launch-analysis` | $7.99 | Evaluate tokenomics, team, risks, and potential |
| `rug-detect` | $4.99 | Rug pull detector — analyze any token for scam risk |

### Popular Services

| Service | Price | Description |
|---|---|---|
| `wallet-risk` | $0.85 | Security analysis for any EVM address |
| `transaction-simulator` | $0.85 | Predict transaction outcome before signing |
| `swap-routing` | $0.99 | Find best DEX swap price across DEXes |
| `portfolio-tracker` | $0.99 | Balance & P&L for any wallet |
| `yield-calculator` | $0.50 | DeFi yield calculator — APY/APR |
| `token-screener` | $0.30 | Risk & fundamentals for any ERC20 |

## Discovery Endpoints (Machine-Readable Marketing)

- `/.well-known/x402` — x402 service discovery (RFC-style)
- `/openapi.json` — OpenAPI 3.0 spec with `x-payment-info` extensions
- `/llms.txt` — LLM-friendly API documentation (for AI agents)
- `/agents.json` — AI agent manifest (ERC-8004 style)
- `/mcp` — MCP server endpoint (Streamable HTTP transport)
- `/health` — Health check

## MCP Integration

Use as an MCP server in Claude Desktop, Cursor, Cline, or any MCP-compatible agent:

```json
{
  "mcpServers": {
    "afaagent-x402": {
      "transport": "streamableHttp",
      "url": "https://afaagent-x402-api.brazen-rotate.workers.dev/mcp"
    }
  }
}
```

All 43 tools are available as MCP tools with inline pricing info.

## Payment Details

- **Network**: Base (eip155:8453)
- **Token**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Wallet**: `0x7B8401b5B4ee319aa47DC5F12b869e5Be460A9B2`
- **Decimals**: 6
- **Facilitator**: Coinbase CDP (x402 v2)

## Architecture

```
Client / AI Agent
   │
   ▼ POST /api/v1/{service}
Cloudflare Worker (Global Edge, <50ms)
   │
   ├─► 402 Payment Required (x402 v2)
   │      {amount, payTo, asset, network}
   │
   ├─► Client pays USDC on Base
   │
   └─► POST /api/v1/{service} + X-Payment: <tx_hash>
         │
         ▼
      Coinbase CDP verifies payment
         │
         ▼
      JSON result returned
```

## Listed In

- [x402Scout](https://x402scan.com) — x402 service directory
- [Agent402](https://agent402.app) — AI agent marketplace
- [mcp.so](https://mcp.so) — MCP server directory
- [Glama](https://glama.ai/mcp/servers) — MCP server registry
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) (PR pending)
- [awesome-x402](https://github.com/afaagent/awesome-x402)
- [awesome-x402-servers](https://github.com/afaagent/awesome-x402-servers)

## Development

```bash
# Install dependencies
npm install

# Run local server (port 3000)
npm start

# Deploy to Cloudflare Workers
npx wrangler deploy --temporary
```

## License

MIT
