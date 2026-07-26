const SERVICE_META = {
  'summarize': {
    input: { text: 'The quick brown fox jumps over the lazy dog. This is a sample text for summarization testing.', max_length: 200 },
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, max_length: { type: 'number' } }, required: ['text'] },
    output: { summary: 'The quick brown fox jumps over the lazy dog.', original_length: 95, summary_length: 43, compression_ratio: '55%', sentences_extracted: 2 }
  },
  'sentiment': {
    input: { text: 'I absolutely love this product, it works amazing and the quality is fantastic!' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    output: { score: 0.8, label: 'positive', positive_words: 5, negative_words: 0, confidence: '80%' }
  },
  'qrcode': {
    input: { text: 'https://afaagent.ai', size: 256, color: '#000000', bgColor: '#ffffff' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, size: { type: 'number' }, color: { type: 'string' }, bgColor: { type: 'string' } }, required: ['text'] },
    output: { qr_code_svg: '<svg>...</svg>', data_url: 'data:image/svg+xml;base64,...', size: 256, content: 'https://afaagent.ai' }
  },
  'json-format': {
    input: { json: '{"name":"test","value":123}', mode: 'beautify' },
    inputSchema: { type: 'object', properties: { json: { type: 'string' }, mode: { type: 'string', enum: ['beautify', 'minify', 'validate'] } }, required: ['json'] },
    output: { result: '{\n  "name": "test",\n  "value": 123\n}', valid: true, mode: 'beautify' }
  },
  'password-strength': {
    input: { password: 'MyP@ssw0rd!2024' },
    inputSchema: { type: 'object', properties: { password: { type: 'string' } }, required: ['password'] },
    output: { score: 85, label: 'strong', length: 14, has_upper: true, has_lower: true, has_numbers: true, has_symbols: true, crack_time_seconds: 315360000 }
  },
  'keyword-extractor': {
    input: { text: 'Artificial intelligence and machine learning are transforming software development practices worldwide.', top_n: 5 },
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, top_n: { type: 'number' } }, required: ['text'] },
    output: { keywords: ['artificial intelligence', 'machine learning', 'software development', 'transforming', 'practices'], count: 5 }
  },
  'language-detect': {
    input: { text: 'Bonjour, comment allez-vous aujourdhui?' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    output: { language: 'french', code: 'fr', confidence: 0.92, detected_languages: [{ language: 'french', code: 'fr', score: 0.92 }, { language: 'english', code: 'en', score: 0.05 }] }
  },
  'markdown-to-html': {
    input: { markdown: '# Hello\n\nThis is **bold** text.' },
    inputSchema: { type: 'object', properties: { markdown: { type: 'string' } }, required: ['markdown'] },
    output: { html: '<h1>Hello</h1>\n<p>This is <strong>bold</strong> text.</p>', word_count: 5 }
  },
  'base64-encode': {
    input: { text: 'Hello, World!', action: 'encode' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, action: { type: 'string', enum: ['encode', 'decode'] } }, required: ['text', 'action'] },
    output: { result: 'SGVsbG8sIFdvcmxkIQ==', action: 'encode' }
  },
  'color-palette': {
    input: { baseColor: '#3B82F6', count: 5 },
    inputSchema: { type: 'object', properties: { baseColor: { type: 'string' }, count: { type: 'number' } }, required: ['baseColor'] },
    output: { palette: [{ hex: '#3B82F6', name: 'primary' }, { hex: '#60A5FA', name: 'light' }, { hex: '#2563EB', name: 'dark' }, { hex: '#93C5FD', name: 'pale' }, { hex: '#1D4ED8', name: 'deep' }], count: 5 }
  },
  'crypto-prices': {
    input: { tokens: ['BTC', 'ETH', 'SOL'], currency: 'USD' },
    inputSchema: { type: 'object', properties: { tokens: { type: 'array', items: { type: 'string' } }, currency: { type: 'string' } }, required: ['tokens'] },
    output: { prices: { BTC: 67500.50, ETH: 3450.25, SOL: 145.80 }, currency: 'USD', last_updated: '2026-07-27T12:00:00Z' }
  },
  'gas-tracker': {
    input: { network: 'ethereum' },
    inputSchema: { type: 'object', properties: { network: { type: 'string', enum: ['ethereum', 'base', 'polygon', 'arbitrum'] } }, required: ['network'] },
    output: { network: 'ethereum', slow: { gwei: 25, usd: 0.75 }, standard: { gwei: 35, usd: 1.05 }, fast: { gwei: 50, usd: 1.50 }, base_fee: 28.5 }
  },
  'wallet-risk': {
    input: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0' },
    inputSchema: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] },
    output: { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0', risk_score: 25, risk_level: 'low', flags: [], age_days: 1200, tx_count: 1500 }
  },
  'token-screener': {
    input: { tokenAddress: '0x4200000000000000000000000000000000000006', chain: 'base' },
    inputSchema: { type: 'object', properties: { tokenAddress: { type: 'string' }, chain: { type: 'string' } }, required: ['tokenAddress'] },
    output: { token: 'WETH', address: '0x4200000000000000000000000000000000000006', risk_score: 15, risk_level: 'low', liquidity_usd: 500000000, market_cap_usd: 1200000000, holder_count: 85000 }
  },
  'portfolio-tracker': {
    input: { wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0', chain: 'ethereum' },
    inputSchema: { type: 'object', properties: { wallet: { type: 'string' }, chain: { type: 'string' } }, required: ['wallet'] },
    output: { wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0', total_value_usd: 125000, tokens: [{ symbol: 'ETH', balance: 25.5, value_usd: 87750 }, { symbol: 'USDC', balance: 35000, value_usd: 35000 }], pnl_24h_usd: 2500, pnl_24h_pct: 2.04 }
  },
  'yield-calculator': {
    input: { principal: 10000, apy: 8.5, days: 365, compound: 'daily' },
    inputSchema: { type: 'object', properties: { principal: { type: 'number' }, apy: { type: 'number' }, days: { type: 'number' }, compound: { type: 'string' } }, required: ['principal', 'apy'] },
    output: { principal: 10000, apy: 8.5, days: 365, final_amount: 10887.17, total_interest: 887.17, apy_effective: 8.87 }
  },
  'gas-estimator': {
    input: { from: '0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0', to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', value: '0.1', network: 'ethereum' },
    inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, value: { type: 'string' }, network: { type: 'string' } }, required: ['from', 'to', 'value'] },
    output: { network: 'ethereum', estimated_gas: 21000, gas_price_gwei: 35, total_cost_eth: 0.000735, total_cost_usd: 2.57, speed: 'standard' }
  },
  'nft-metadata': {
    input: { contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', tokenId: '1' },
    inputSchema: { type: 'object', properties: { contractAddress: { type: 'string' }, tokenId: { type: 'string' } }, required: ['contractAddress', 'tokenId'] },
    output: { valid: true, name: 'Bored Ape #1', description: 'A bored ape NFT', image: 'ipfs://Qm...', attributes: [{ trait_type: 'Background', value: 'Yellow' }], token_uri: 'ipfs://Qm...' }
  },
  'swap-routing': {
    input: { tokenIn: 'ETH', tokenOut: 'USDC', amount: '1.0', chain: 'base', slippage: 0.5 },
    inputSchema: { type: 'object', properties: { tokenIn: { type: 'string' }, tokenOut: { type: 'string' }, amount: { type: 'string' }, chain: { type: 'string' }, slippage: { type: 'number' } }, required: ['tokenIn', 'tokenOut', 'amount'] },
    output: { best_dex: 'Uniswap V3', estimated_output: 3450.50, price_impact: 0.12, path: ['WETH', 'USDC'], fee_usd: 0.25, minimum_received: 3433.25 }
  },
  'transaction-simulator': {
    input: { from: '0x742d35Cc6634C0532925a3b844Bc9e7595f7AAA0', to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', data: '0x...', value: '0.1', network: 'ethereum' },
    inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, data: { type: 'string' }, value: { type: 'string' }, network: { type: 'string' } }, required: ['from', 'to'] },
    output: { success: true, simulated: true, gas_used: 45000, state_changes: [{ address: '0x...', change: '+100 USDC' }], error: null }
  },
  'text-rewrite': {
    input: { text: 'The cat sat on the mat.', style: 'professional' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, style: { type: 'string', enum: ['professional', 'casual', 'academic', 'creative'] } }, required: ['text'] },
    output: { original: 'The cat sat on the mat.', rewritten: 'The feline was positioned upon the floor covering.', style: 'professional', word_count: 7 }
  },
  'headline-generator': {
    input: { topic: 'AI cryptocurrency trading bots', count: 10, style: 'clickbait' },
    inputSchema: { type: 'object', properties: { topic: { type: 'string' }, count: { type: 'number' }, style: { type: 'string' } }, required: ['topic'] },
    output: { topic: 'AI cryptocurrency trading bots', headlines: ['You Will Not Believe What This AI Bot Did With $1000 in Crypto...', 'Top 10 AI Trading Bots That Make Millionaires in 2026', 'The Shocking Truth About AI Crypto Trading Bots'], count: 10 }
  },
  'seo-meta': {
    input: { url: 'https://example.com', title: 'Example Page', content: 'This is an example page about digital marketing and SEO best practices for 2026.' },
    inputSchema: { type: 'object', properties: { url: { type: 'string' }, title: { type: 'string' }, content: { type: 'string' } }, required: ['url', 'content'] },
    output: { meta_title: 'Example Page | Digital Marketing & SEO Best Practices 2026', meta_description: 'Learn the latest digital marketing and SEO best practices for 2026 on our example page.', og_title: 'Example Page - SEO Guide 2026', og_description: 'Master digital marketing with our comprehensive SEO guide.', keywords: 'SEO, digital marketing, 2026, best practices' }
  },
  'text-complexity': {
    input: { text: 'The cat sat on the mat. It was a sunny day.' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    output: { flesch_kincaid_grade: 2.5, flesch_reading_ease: 95, gunning_fog: 3.0, word_count: 13, sentence_count: 2, avg_words_per_sentence: 6.5 }
  },
  'entity-extractor': {
    input: { text: 'Apple Inc. was founded by Steve Jobs in Cupertino, California on April 1, 1976.' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    output: { entities: { persons: ['Steve Jobs'], organizations: ['Apple Inc.'], locations: ['Cupertino', 'California'], dates: ['April 1, 1976'] }, total: 5 }
  },
  'regex-builder': {
    input: { pattern: 'email', testString: 'test@example.com' },
    inputSchema: { type: 'object', properties: { pattern: { type: 'string' }, testString: { type: 'string' } }, required: ['pattern'] },
    output: { regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', description: 'Email address pattern', matches: ['test@example.com'], valid: true }
  },
  'hash-generator': {
    input: { text: 'Hello, World!', algorithm: 'sha256' },
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, algorithm: { type: 'string', enum: ['md5', 'sha1', 'sha256', 'sha512', 'bcrypt'] } }, required: ['text'] },
    output: { algorithm: 'sha256', hash: 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f', input: 'Hello, World!' }
  },
  'uuid-generator': {
    input: { version: 'v4', count: 5 },
    inputSchema: { type: 'object', properties: { version: { type: 'string', enum: ['v1', 'v4', 'v5'] }, count: { type: 'number' } }, required: ['version'] },
    output: { version: 'v4', uuids: ['550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8'], count: 5 }
  },
  'timestamp-converter': {
    input: { timestamp: 1753689600, fromFormat: 'unix', toFormat: 'iso' },
    inputSchema: { type: 'object', properties: { timestamp: { type: 'number' }, fromFormat: { type: 'string' }, toFormat: { type: 'string' } }, required: ['timestamp'] },
    output: { original: 1753689600, converted: '2026-07-27T12:00:00.000Z', formats: { unix: 1753689600, iso: '2026-07-27T12:00:00.000Z', relative: 'in 3 hours' } }
  },
  'diff-checker': {
    input: { text1: 'Hello World\nHow are you?', text2: 'Hello Universe\nHow are you?', mode: 'unified' },
    inputSchema: { type: 'object', properties: { text1: { type: 'string' }, text2: { type: 'string' }, mode: { type: 'string' } }, required: ['text1', 'text2'] },
    output: { diff: '- Hello World\n+ Hello Universe\n  How are you?', changes: 1, additions: 1, deletions: 1, unchanged: 1 }
  },
  'ip-geolocation': {
    input: { ip: '8.8.8.8' },
    inputSchema: { type: 'object', properties: { ip: { type: 'string' } }, required: ['ip'] },
    output: { ip: '8.8.8.8', country: 'United States', country_code: 'US', city: 'Mountain View', region: 'California', timezone: 'America/Los_Angeles', latitude: 37.386, longitude: -122.0838, isp: 'Google LLC' }
  },
  'url-shortener': {
    input: { url: 'https://example.com/very/long/url/path', alias: 'short' },
    inputSchema: { type: 'object', properties: { url: { type: 'string' }, alias: { type: 'string' } }, required: ['url'] },
    output: { original_url: 'https://example.com/very/long/url/path', short_url: 'https://afa.ai/short', alias: 'short', expires_at: null }
  },
  'user-agent-parser': {
    input: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    inputSchema: { type: 'object', properties: { userAgent: { type: 'string' } }, required: ['userAgent'] },
    output: { browser: { name: 'Chrome', version: '120.0.0.0', major: '120' }, os: { name: 'Windows', version: '10' }, device: { type: 'desktop', vendor: null }, isMobile: false, isTablet: false, isDesktop: true }
  },
  'currency-converter': {
    input: { amount: 100, from: 'USD', to: 'EUR' },
    inputSchema: { type: 'object', properties: { amount: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['amount', 'from', 'to'] },
    output: { amount: 100, from: 'USD', to: 'EUR', result: 92.5, rate: 0.925, last_updated: '2026-07-27T12:00:00Z' }
  },
  'markdown-summary': {
    input: { markdown: '# Introduction\n\nThis is the intro.\n\n## Details\n\nHere are details.', depth: 2 },
    inputSchema: { type: 'object', properties: { markdown: { type: 'string' }, depth: { type: 'number' } }, required: ['markdown'] },
    output: { structure: [{ level: 1, text: 'Introduction', section: 'This is the intro.' }, { level: 2, text: 'Details', section: 'Here are details.' }], headings_count: 2, word_count: 12 }
  },
  'json-schema-validator': {
    input: { json: '{"name": "test", "age": 25}', schema: '{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "number"}}, "required": ["name"]}' },
    inputSchema: { type: 'object', properties: { json: { type: 'string' }, schema: { type: 'string' } }, required: ['json', 'schema'] },
    output: { valid: true, errors: [], schema: { type: 'object' }, instance: { name: 'test', age: 25 } }
  },
  'favicon-generator': {
    input: { text: 'AA', color: '#ffffff', bgColor: '#3B82F6', size: 32 },
    inputSchema: { type: 'object', properties: { text: { type: 'string' }, color: { type: 'string' }, bgColor: { type: 'string' }, size: { type: 'number' } }, required: ['text'] },
    output: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#3B82F6"/><text x="16" y="20" text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">AA</text></svg>', size: 32, text: 'AA', data_url: 'data:image/svg+xml;base64,...' }
  },
  'domains-available': {
    input: { query: 'my startup idea', tlds: ['.com', '.io', '.ai'] },
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, tlds: { type: 'array', items: { type: 'string' } } }, required: ['query'] },
    output: { query: 'my startup idea', results: [{ domain: 'mystartupidea.com', available: false, price: null }, { domain: 'mystartupidea.io', available: true, price: 39.99 }, { domain: 'mystartupidea.ai', available: true, price: 79.99 }], suggestions: ['startupidea.ai', 'myidea.io'] }
  },
  'smart-contract-audit': {
    input: { code: 'pragma solidity ^0.8.0;\ncontract Simple {\n  uint256 public balance;\n  function deposit() public payable {\n    balance += msg.value;\n  }\n}', chain: 'ethereum' },
    inputSchema: { type: 'object', properties: { code: { type: 'string' }, chain: { type: 'string' } }, required: ['code'] },
    output: { severity_score: 35, risk_level: 'low', issues: [{ severity: 'informational', title: 'No events emitted', description: 'Deposit function does not emit an event' }], summary: 'Contract has no critical vulnerabilities. 1 informational issue found.', lines_analyzed: 8 }
  },
  'defi-strategy': {
    input: { capital: 50000, riskTolerance: 'medium', horizonMonths: 12, chains: ['base', 'arbitrum'] },
    inputSchema: { type: 'object', properties: { capital: { type: 'number' }, riskTolerance: { type: 'string', enum: ['conservative', 'medium', 'aggressive'] }, horizonMonths: { type: 'number' }, chains: { type: 'array' } }, required: ['capital', 'riskTolerance'] },
    output: { capital: 50000, risk_tolerance: 'medium', projected_apy: 12.5, allocation: [{ protocol: 'Aave V3', chain: 'Base', allocation_pct: 40, estimated_apy: 7.2 }, { protocol: 'Uniswap V3', chain: 'Base', allocation_pct: 35, estimated_apy: 15.8 }, { protocol: 'Beefy Finance', chain: 'Arbitrum', allocation_pct: 25, estimated_apy: 18.5 }], monthly_yield_usd: 520.83 }
  },
  'portfolio-rebalancer': {
    input: { portfolio: [{ symbol: 'BTC', value: 50000 }, { symbol: 'ETH', value: 30000 }, { symbol: 'USDC', value: 20000 }], targetAllocation: { BTC: 40, ETH: 35, USDC: 15, SOL: 10 }, rebalanceThreshold: 5 },
    inputSchema: { type: 'object', properties: { portfolio: { type: 'array' }, targetAllocation: { type: 'object' }, rebalanceThreshold: { type: 'number' } }, required: ['portfolio', 'targetAllocation'] },
    output: { total_value: 100000, current_allocation: { BTC: 50, ETH: 30, USDC: 20 }, target_allocation: { BTC: 40, ETH: 35, USDC: 15, SOL: 10 }, trades: [{ action: 'sell', symbol: 'BTC', amount_usd: 10000 }, { action: 'buy', symbol: 'ETH', amount_usd: 5000 }, { action: 'buy', symbol: 'SOL', amount_usd: 10000 }], rebalance_needed: true }
  },
  'token-launch-analysis': {
    input: { tokenAddress: '0x...', chain: 'base', includeRugCheck: true },
    inputSchema: { type: 'object', properties: { tokenAddress: { type: 'string' }, chain: { type: 'string' }, includeRugCheck: { type: 'boolean' } }, required: ['tokenAddress'] },
    output: { token: 'NEWTOKEN', address: '0x...', chain: 'base', overall_score: 65, tokenomics: { supply: '1000000000', circulating_pct: 35, burn_pct: 0, mintable: false }, liquidity: { locked: true, lock_days: 365, amount_usd: 500000 }, team: { doxxed: false, verified: false }, risks: ['Team not doxxed', 'High token concentration'], verdict: 'Moderate risk - proceed with caution' }
  },
  'rug-detect': {
    input: { tokenAddress: '0x...', chain: 'base' },
    inputSchema: { type: 'object', properties: { tokenAddress: { type: 'string' }, chain: { type: 'string' } }, required: ['tokenAddress'] },
    output: { token_address: '0x...', chain: 'base', rug_risk_score: 25, risk_level: 'low', red_flags: [], green_flags: ['Liquidity locked', 'Contract verified', 'No mint function', 'Ownership renounced'], analysis_summary: 'This token shows low rug pull risk. All major safety checks pass.' }
  },
};

function getMeta(serviceId) {
  return SERVICE_META[serviceId] || {
    input: { input: 'value' },
    inputSchema: { type: 'object', properties: { input: { type: 'string' } }, required: ['input'] },
    output: { result: 'success' }
  };
}

module.exports = { SERVICE_META, getMeta };
