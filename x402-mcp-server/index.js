#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const X402_API_BASE = process.env.X402_API_BASE || 'http://localhost:3000';
const WALLET = process.env.X402_WALLET || '0x0c1fa40d4600081270c931811587d68af18b0b94';

const SERVICES = {
  'crypto-prices': { price: 0.05, desc: 'Get real-time cryptocurrency prices for 1000+ tokens', input: { tokens: 'array of token IDs (bitcoin, ethereum, solana)', vs_currency: 'string (default: usd)' } },
  'gas-tracker': { price: 0.03, desc: 'Track gas prices across Ethereum, Base, Polygon and other networks', input: { network: 'string (default: ethereum)' } },
  'wallet-risk': { price: 0.85, desc: 'Analyze security risk of any EVM wallet address', input: { address: 'string (required)', network: 'string (default: ethereum)' } },
  'token-screener': { price: 0.30, desc: 'Screen any ERC20 token for risk and fundamentals', input: { contract_address: 'string (required)', chain: 'string (default: ethereum)' } },
  'portfolio-tracker': { price: 0.99, desc: 'Analyze wallet portfolio with balances and P&L', input: { address: 'string (required)', chain: 'string (default: ethereum)' } },
  'yield-calculator': { price: 0.50, desc: 'Calculate DeFi yield with different compound frequencies', input: { principal: 'number (required)', apy: 'number (required)', days: 'number (default: 365)', compound: 'string - daily/weekly/monthly/quarterly/yearly' } },
  'gas-estimator': { price: 0.20, desc: 'Estimate transaction gas cost in USD', input: { gas_limit: 'number (default: 21000)', gas_price_gwei: 'number (optional)', network: 'string (default: ethereum)' } },
  'nft-metadata': { price: 0.30, desc: 'Validate and parse ERC721/ERC1155 NFT metadata', input: { token_uri: 'string (required)', contract_address: 'string', token_id: 'string' } },
  'swap-routing': { price: 0.99, desc: 'Find best DEX swap route across multiple DEXes', input: { from_token: 'string (default: ETH)', to_token: 'string (default: USDC)', amount: 'string (default: 1)', network: 'string (default: ethereum)' } },
  'transaction-simulator': { price: 0.85, desc: 'Simulate transaction outcome before signing', input: { from: 'string (required)', to: 'string (required)', value: 'string (default: 0)', data: 'string (default: 0x)', network: 'string (default: ethereum)' } },
  'smart-contract-audit': { price: 9.99, desc: 'Smart contract security audit - detect vulnerabilities and risks', input: { code: 'string (required)', contract_type: 'string (default: solidity)' } },
  'rug-detect': { price: 4.99, desc: 'Rug pull detector - analyze token contract for scam risks', input: { contract_address: 'string (required)', chain: 'string (default: ethereum)' } },
  'defi-strategy': { price: 19.99, desc: 'DeFi strategy builder - personalized yield farming strategy', input: { capital: 'number (required)', risk_tolerance: 'string - low/medium/high (default: medium)', preferred_chains: 'array of strings' } },
  'portfolio-rebalancer': { price: 14.99, desc: 'Portfolio rebalancing - optimal token allocation', input: { portfolio: 'object (required)', target_risk: 'string - conservative/moderate/aggressive' } },
  'token-launch-analysis': { price: 7.99, desc: 'Token launch evaluation - tokenomics, team, risks analysis', input: { contract_address: 'string (required)', chain: 'string (default: ethereum)', whitepaper_url: 'string (optional)' } },
  'summarize': { price: 0.05, desc: 'Text summarization - concise summary of any text', input: { text: 'string (required)', max_length: 'number (optional)', style: 'string - bullet/paragraph' } },
  'sentiment': { price: 0.03, desc: 'Sentiment analysis - positive/negative/neutral score', input: { text: 'string (required)', language: 'string (optional)' } },
  'keyword-extractor': { price: 0.03, desc: 'Keyword extraction - top keywords from any text', input: { text: 'string (required)', limit: 'number (default: 10)' } },
  'language-detect': { price: 0.02, desc: 'Language detection - identify language of text', input: { text: 'string (required)' } },
  'text-complexity': { price: 0.05, desc: 'Readability score - Flesch-Kincaid, Gunning Fog, and more', input: { text: 'string (required)' } },
  'entity-extractor': { price: 0.12, desc: 'Entity extraction - people, places, orgs, dates from text', input: { text: 'string (required)', types: 'array of entity types (optional)' } },
  'text-rewrite': { price: 0.10, desc: 'Text rewriter - paraphrase and rewrite in multiple styles', input: { text: 'string (required)', style: 'string - formal/casual/professional/academic', tone: 'string (optional)' } },
  'headline-generator': { price: 0.08, desc: 'Headline generator - 10+ catchy headlines for any topic', input: { topic: 'string (required)', style: 'string (default: general)', count: 'number (default: 10)' } },
  'seo-meta': { price: 0.15, desc: 'SEO meta tag generator - title, description, OG tags', input: { content: 'string (required)', title: 'string (optional)', url: 'string (optional)', keywords: 'array (optional)' } },
  'markdown-summary': { price: 0.04, desc: 'Markdown summarizer - extract structure, headings, key points', input: { markdown: 'string (required)', depth: 'number (default: 3)' } },
  'qrcode': { price: 0.02, desc: 'QR code generator with size and color options', input: { data: 'string (required)', size: 'number (default: 256)', color: 'string (default: 000000)', background: 'string (default: ffffff)' } },
  'json-format': { price: 0.01, desc: 'JSON formatter - beautify, minify, validate JSON', input: { json: 'string (required)', action: 'string - beautify/minify/validate (default: beautify)', indent: 'number (default: 2)' } },
  'password-strength': { price: 0.02, desc: 'Password strength checker - detailed security analysis', input: { password: 'string (required)' } },
  'markdown-to-html': { price: 0.02, desc: 'Markdown to HTML converter', input: { markdown: 'string (required)', options: 'object (optional)' } },
  'base64-encode': { price: 0.01, desc: 'Base64 encode and decode', input: { data: 'string (required)', action: 'string - encode/decode (default: encode)' } },
  'color-palette': { price: 0.02, desc: 'Color palette generator from hex color', input: { base_color: 'string (default: 3b82f6)', scheme: 'string - complementary/analogous/triadic/monochromatic (default: complementary)', count: 'number (default: 5)' } },
  'regex-builder': { price: 0.10, desc: 'Regex builder - generate and test regular expressions', input: { description: 'string (required)', test_string: 'string (optional)', flags: 'string (default: g)' } },
  'hash-generator': { price: 0.03, desc: 'Hash generator - MD5, SHA1, SHA256, SHA512, bcrypt', input: { text: 'string (required)', algorithm: 'string - md5/sha1/sha256/sha512/bcrypt (default: sha256)' } },
  'uuid-generator': { price: 0.01, desc: 'UUID generator - v1, v4, v5 UUIDs in bulk', input: { count: 'number (default: 1)', version: 'string - v1/v4/v5 (default: v4)' } },
  'timestamp-converter': { price: 0.02, desc: 'Timestamp converter - Unix, ISO, relative time formats', input: { timestamp: 'number/string (optional, uses current if not provided)', from_format: 'string (default: unix)', to_format: 'string (default: iso)' } },
  'diff-checker': { price: 0.05, desc: 'Diff checker - compare two texts and show differences', input: { text1: 'string (required)', text2: 'string (required)', format: 'string - unified/split (default: unified)' } },
  'ip-geolocation': { price: 0.03, desc: 'IP geolocation - country, city, timezone for any IP', input: { ip: 'string (required)' } },
  'url-shortener': { price: 0.01, desc: 'URL shortener - create short links with custom aliases', input: { url: 'string (required)', alias: 'string (optional)' } },
  'user-agent-parser': { price: 0.02, desc: 'User agent parser - detect browser, OS, device from UA string', input: { ua: 'string (required)' } },
  'currency-converter': { price: 0.05, desc: 'Currency converter - real-time exchange rates for 150+ fiat', input: { amount: 'number (default: 1)', from: 'string (default: USD)', to: 'string (default: EUR)' } },
  'json-schema-validator': { price: 0.05, desc: 'JSON schema validator - validate any JSON against a schema', input: { json: 'string/object (required)', schema: 'string/object (required)' } },
  'favicon-generator': { price: 0.03, desc: 'Favicon generator - create favicon SVG from text or initials', input: { text: 'string (required)', color: 'string (default: white)', background: 'string (default: 3b82f6)', size: 'number (default: 64)' } },
  'domains-available': { price: 0.04, desc: 'Domain availability check and alternative suggestions', input: { domain: 'string (required)', tlds: 'array (default: [com, net, org, io, dev, xyz])' } },
};

function toMcpName(serviceId) {
  return serviceId.replace(/-/g, '_');
}

function generateInputSchema(service) {
  const props = {};
  const required = [];
  
  if (service.input) {
    for (const [key, desc] of Object.entries(service.input)) {
      if (desc.includes('(required)')) {
        required.push(key);
      }
      if (desc.includes('array')) {
        props[key] = { type: 'array', items: { type: 'string' }, description: desc };
      } else if (desc.includes('number')) {
        props[key] = { type: 'number', description: desc };
      } else if (desc.includes('object')) {
        props[key] = { type: 'object', description: desc };
      } else {
        props[key] = { type: 'string', description: desc };
      }
    }
  }
  
  return {
    type: 'object',
    properties: props,
    required: required.length > 0 ? required : undefined,
  };
}

const TOOLS = Object.entries(SERVICES).map(([id, service]) => ({
  name: toMcpName(id),
  description: service.desc,
  price: service.price,
  endpointId: id,
  inputSchema: generateInputSchema(service),
}));

async function callApi(endpoint, body) {
  const response = await fetch(`${X402_API_BASE}/api/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  
  if (response.status === 402) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`PAYMENT_REQUIRED: This tool costs $${err.price || '?'} USDC. Pay via x402 protocol to ${WALLET} on Base network.`);
  }
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${response.status}`);
  }
  
  return response.json();
}

async function main() {
  const server = new Server(
    {
      name: 'afaagent-x402-suite',
      version: '4.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map(t => ({
      name: t.name,
      description: `${t.description} (Cost: $${t.price.toFixed(2)} USDC per call via x402 protocol)`,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = TOOLS.find(t => t.name === name);
    if (!tool) {
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }

    try {
      const result = await callApi(tool.endpointId, args || {});
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AfaAgent x402 API Suite - MCP Server');
  console.error(`API base: ${X402_API_BASE}`);
  console.error(`Total tools: ${TOOLS.length}`);
  console.error(`Payment wallet: ${WALLET} (Base USDC)`);
  console.error('Premium tools: smart-contract-audit ($9.99), defi-strategy ($19.99), portfolio-rebalancer ($14.99), token-launch-analysis ($7.99), rug-detect ($4.99)');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
