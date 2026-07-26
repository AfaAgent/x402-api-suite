# AfaAgent API Suite

**43 production-grade APIs** across DeFi, wallet security, AI tools, developer utilities, SEO, and crypto analytics. All pay-per-call USDC on Base via x402 protocol.

Built for AI agents and autonomous systems. No API keys. No subscriptions. Pay only for what you use.

## Quick Start

```bash
# Check available endpoints
curl https://YOUR_GATEWAY_URL/.well-known/x402

# Example: get crypto prices (pays $0.05 USDC)
curl -X POST https://YOUR_GATEWAY_URL/api/v1/crypto-prices \
  -H "Content-Type: application/json" \
  -d '{"tokens":["bitcoin","ethereum"]}'
```

## Categories

### 🔗 Blockchain & Web3 (12)
| Service | Price | Description |
|---------|-------|-------------|
| crypto-prices | $0.05 | Real-time crypto prices |
| gas-tracker | $0.03 | Gas price tracker |
| wallet-risk | $0.85 | Wallet security risk score |
| token-screener | $0.30 | Token risk & fundamentals |
| portfolio-tracker | $0.99 | Portfolio balance & P&L |
| yield-calculator | $0.50 | DeFi yield calculator |
| gas-estimator | $0.20 | Transaction gas cost in USD |
| nft-metadata | $0.30 | NFT metadata validator |
| swap-routing | $0.99 | DEX swap router |
| transaction-simulator | $0.85 | Predict tx outcome |
| **smart-contract-audit** | **$9.99** | Smart contract security audit |
| **rug-detect** | **$4.99** | Rug pull detector |

### 💰 Finance & Premium (3)
| Service | Price | Description |
|---------|-------|-------------|
| **defi-strategy** | **$19.99** | DeFi strategy builder |
| **portfolio-rebalancer** | **$14.99** | Portfolio rebalancing |
| **token-launch-analysis** | **$7.99** | Token launch evaluation |

### 🤖 AI & ML (6)
| Service | Price | Description |
|---------|-------|-------------|
| summarize | $0.05 | Text summarization |
| sentiment | $0.03 | Sentiment analysis |
| keyword-extractor | $0.03 | Keyword extraction |
| language-detect | $0.02 | Language detection |
| text-complexity | $0.05 | Readability score |
| entity-extractor | $0.12 | Named entity extraction |

### 📝 Content & Marketing (4)
| Service | Price | Description |
|---------|-------|-------------|
| text-rewrite | $0.10 | Text paraphrasing |
| headline-generator | $0.08 | Headline generation |
| seo-meta | $0.15 | SEO meta tag generator |
| markdown-summary | $0.04 | Markdown summarizer |

### 🛠️ Developer Tools (18)
| Service | Price | Description |
|---------|-------|-------------|
| qrcode | $0.02 | QR code generator |
| json-format | $0.01 | JSON formatter |
| password-strength | $0.02 | Password strength checker |
| markdown-to-html | $0.02 | Markdown to HTML |
| base64-encode | $0.01 | Base64 encoder |
| color-palette | $0.02 | Color palette generator |
| regex-builder | $0.10 | Regex builder & tester |
| hash-generator | $0.03 | Hash generator |
| uuid-generator | $0.01 | UUID generator |
| timestamp-converter | $0.02 | Timestamp converter |
| diff-checker | $0.05 | Text diff checker |
| ip-geolocation | $0.03 | IP geolocation |
| url-shortener | $0.01 | URL shortener |
| user-agent-parser | $0.02 | User agent parser |
| currency-converter | $0.05 | Fiat currency converter |
| json-schema-validator | $0.05 | JSON schema validator |
| favicon-generator | $0.03 | Favicon SVG generator |
| domains-available | $0.04 | Domain availability check |

## Payment Protocol

All endpoints use **x402** (HTTP 402 Payment Required) with **USDC on Base**.

- **Network**: Base (eip155:8453)
- **Asset**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Wallet**: `0x0c1fa40d4600081270c931811587d68af18b0b94`
- **Scheme**: exact (EIP-3009 TransferWithAuthorization)

## Machine-Readable

- `.well-known/x402` - x402 service discovery
- `openapi.json` - OpenAPI 3.1 specification
- `llms.txt` - LLM-friendly documentation
- `agents.json` - AI agent manifest

## MCP Server

Available as MCP server for Claude Desktop, Cursor, and other MCP clients.

See [x402-mcp-server](https://github.com/AfaAgent/x402-api-suite/tree/main/x402-mcp-server) for setup.

## License

MIT
