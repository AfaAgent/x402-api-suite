# AfaAgent x402 MCP Server

MCP server with **43 tools** powered by x402 pay-per-call API. Accessible from Claude Desktop, Cursor, Cline, and any MCP-compatible client.

## Quick Start

```bash
cd x402-mcp-server
npm install
X402_API_BASE=https://your-gateway-url node index.js
```

## Configuration

Add to your MCP client config:

```json
{
  "mcpServers": {
    "afaagent-x402": {
      "command": "node",
      "args": ["x402-mcp-server/index.js"],
      "env": {
        "X402_API_BASE": "https://afaagent-x402.example.com",
        "X402_WALLET": "0x0c1fa40d4600081270c931811587d68af18b0b94"
      }
    }
  }
}
```

## Available Tools (43 total)

### Premium ($4.99-$19.99)
- `defi_strategy` ($19.99) — DeFi yield farming strategy builder
- `portfolio_rebalancer` ($14.99) — Optimal portfolio rebalancing
- `smart_contract_audit` ($9.99) — Smart contract security audit
- `token_launch_analysis` ($7.99) — Token launch evaluation
- `rug_detect` ($4.99) — Rug pull risk detector

### High-Value ($0.50-$0.99)
- `portfolio_tracker` ($0.99) — Wallet portfolio analysis
- `swap_routing` ($0.99) — DEX best price routing
- `wallet_risk` ($0.85) — Wallet security risk score
- `transaction_simulator` ($0.85) — Transaction outcome simulation
- `yield_calculator` ($0.50) — DeFi yield calculations

### Standard ($0.10-$0.30)
- `token_screener`, `nft_metadata`, `seo_meta`, `entity_extractor`, `gas_estimator`, `text_rewrite`, `regex_builder`, `headline_generator`

### Utility ($0.01-$0.05)
- 28 tools from crypto prices to UUID generation

## Payment

All tools use **x402 protocol** with USDC on Base network. Payment is per-call.

- **Wallet**: `0x0c1fa40d4600081270c931811587d68af18b0b94`
- **Network**: Base (eip155:8453)
- **Asset**: USDC
