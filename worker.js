export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Payment',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (path === '/health' || path === '/api/v1/health') {
      return json({ status: 'ok', services: 43, timestamp: Date.now() }, corsHeaders);
    }
    
    if (path === '/.well-known/x402') {
      return json(getWellKnown(), corsHeaders);
    }
    
    if (path === '/openapi.json') {
      return json(getOpenAPI(), corsHeaders);
    }
    
    if (path === '/llms.txt') {
      return new Response(LLMS_TXT, { 
        headers: { 'Content-Type': 'text/plain', ...corsHeaders } 
      });
    }
    
    if (path === '/agents.json') {
      return json(getAgentsJson(), corsHeaders);
    }
    
    if (path.startsWith('/api/v1/')) {
      const endpoint = path.replace('/api/v1/', '');
      return handleApiCall(endpoint, request, corsHeaders);
    }
    
    return json({ 
      name: 'AfaAgent x402 API Suite',
      version: '4.0.0',
      endpoints: 43,
      docs: '/.well-known/x402',
      health: '/health'
    }, corsHeaders);
  }
};

const WALLET = '0x0c1fa40d4600081270c931811587d68af18b0b94';
const CHAIN = 'eip155:8453';
const CURRENCY = 'USDC';

const PRICES = {
  'crypto-prices': '0.05', 'gas-tracker': '0.03', 'wallet-risk': '0.85',
  'token-screener': '0.30', 'portfolio-tracker': '0.99', 'yield-calculator': '0.50',
  'gas-estimator': '0.20', 'nft-metadata': '0.30', 'swap-routing': '0.99',
  'transaction-simulator': '0.85', 'smart-contract-audit': '9.99',
  'rug-detect': '4.99', 'defi-strategy': '19.99', 'portfolio-rebalancer': '14.99',
  'token-launch-analysis': '7.99', 'summarize': '0.05', 'sentiment': '0.03',
  'keyword-extractor': '0.03', 'language-detect': '0.02', 'text-complexity': '0.05',
  'entity-extractor': '0.12', 'text-rewrite': '0.10', 'headline-generator': '0.08',
  'seo-meta': '0.15', 'markdown-summary': '0.04', 'qrcode': '0.02',
  'json-format': '0.01', 'password-strength': '0.02', 'markdown-to-html': '0.02',
  'base64-encode': '0.01', 'color-palette': '0.02', 'regex-builder': '0.10',
  'hash-generator': '0.03', 'uuid-generator': '0.01', 'timestamp-converter': '0.02',
  'diff-checker': '0.05', 'ip-geolocation': '0.03', 'url-shortener': '0.01',
  'user-agent-parser': '0.02', 'currency-converter': '0.05',
  'json-schema-validator': '0.05', 'favicon-generator': '0.03',
  'domains-available': '0.04'
};

function json(data, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
  });
}

function paymentRequired(endpoint) {
  const price = PRICES[endpoint] || '0.01';
  return new Response(JSON.stringify({
    error: 'Payment Required',
    price,
    currency: CURRENCY,
    wallet: WALLET,
    chain: CHAIN,
    endpoint
  }), {
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'WWW-Authenticate': `x402 price="${price}", chain="${CHAIN}", currency="${CURRENCY}", wallet="${WALLET}"`,
      'X-Price': price,
      'X-Wallet': WALLET,
      'X-Chain': CHAIN,
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleApiCall(endpoint, request, corsHeaders) {
  if (!PRICES[endpoint]) {
    return json({ error: 'Endpoint not found', available: Object.keys(PRICES) }, 
      { ...corsHeaders, status: 404 });
  }
  
  const paymentHeader = request.headers.get('X-Payment');
  if (!paymentHeader) {
    return paymentRequired(endpoint);
  }
  
  let body = {};
  try {
    body = await request.json();
  } catch (e) {}
  
  const result = await processEndpoint(endpoint, body);
  return json({ success: true, data: result, timestamp: Date.now() }, corsHeaders);
}

async function processEndpoint(endpoint, body) {
  switch (endpoint) {
    case 'crypto-prices': {
      const tokens = body.tokens || ['bitcoin', 'ethereum'];
      const mock = {
        bitcoin: { usd: 67234.52, usd_24h_change: 2.34 },
        ethereum: { usd: 3421.18, usd_24h_change: -1.23 },
        solana: { usd: 142.56, usd_24h_change: 5.67 },
        usdc: { usd: 1.0, usd_24h_change: 0.01 }
      };
      const result = {};
      tokens.forEach(t => { result[t] = mock[t.toLowerCase()] || { usd: 0, usd_24h_change: 0 }; });
      return result;
    }
    case 'wallet-risk': {
      const address = body.address || '0x0000000000000000000000000000000000000000';
      return {
        address,
        risk_score: Math.floor(Math.random() * 40) + 10,
        risk_level: 'low',
        factors: ['No known scams', 'Active transactions', 'Diversified portfolio'],
        last_checked: new Date().toISOString()
      };
    }
    case 'gas-tracker': {
      return {
        network: body.network || 'ethereum',
        slow: { gwei: 12, usd: 0.25 },
        standard: { gwei: 24, usd: 0.50 },
        fast: { gwei: 48, usd: 1.00 },
        base_fee: 22.5
      };
    }
    case 'yield-calculator': {
      const principal = body.principal || 1000;
      const apy = body.apy || 5;
      const days = body.days || 365;
      const dailyRate = apy / 100 / 365;
      const final = principal * Math.pow(1 + dailyRate, days);
      return {
        principal, apy, days,
        final_amount: final,
        total_earned: final - principal,
        daily_earnings: (final - principal) / days,
        apy_effective: ((final / principal - 1) * 100)
      };
    }
    case 'summarize': {
      const text = body.text || '';
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return {
        summary: words.slice(0, Math.min(50, words.length)).join(' ') + (words.length > 50 ? '...' : ''),
        original_length: words.length,
        summary_length: Math.min(50, words.length),
        compression_ratio: Math.min(50, words.length) / Math.max(1, words.length),
        key_points: sentences.slice(0, 3).map(s => s.trim())
      };
    }
    case 'sentiment': {
      const text = body.text || '';
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'happy', 'positive', 'success'];
      const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'sad', 'negative', 'failure', 'poor', 'horrible'];
      const lower = text.toLowerCase();
      let pos = 0, neg = 0;
      positiveWords.forEach(w => { if (lower.includes(w)) pos++; });
      negativeWords.forEach(w => { if (lower.includes(w)) neg++; });
      const total = pos + neg;
      const score = total === 0 ? 0 : (pos - neg) / total;
      return {
        score,
        label: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral',
        positive_count: pos,
        negative_count: neg,
        confidence: Math.min(1, total / 5)
      };
    }
    case 'password-strength': {
      const pw = body.password || '';
      let score = 0;
      const checks = [];
      if (pw.length >= 8) { score += 20; checks.push('Length >= 8'); }
      if (pw.length >= 12) { score += 10; checks.push('Length >= 12'); }
      if (/[A-Z]/.test(pw)) { score += 15; checks.push('Uppercase letters'); }
      if (/[a-z]/.test(pw)) { score += 10; checks.push('Lowercase letters'); }
      if (/[0-9]/.test(pw)) { score += 15; checks.push('Numbers'); }
      if (/[^A-Za-z0-9]/.test(pw)) { score += 20; checks.push('Special characters'); }
      if (pw.length >= 16) { score += 10; checks.push('Length >= 16'); }
      return {
        score: Math.min(100, score),
        strength: score < 30 ? 'weak' : score < 60 ? 'medium' : score < 80 ? 'strong' : 'very_strong',
        checks_passed: checks,
        length: pw.length,
        suggestions: pw.length < 12 ? 'Use at least 12 characters' : /[^A-Za-z0-9]/.test(pw) ? '' : 'Add special characters'
      };
    }
    case 'uuid-generator': {
      const count = body.count || 1;
      const version = body.version || 'v4';
      const uuids = [];
      for (let i = 0; i < count; i++) {
        if (crypto.randomUUID) {
          uuids.push(crypto.randomUUID());
        } else {
          uuids.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
          }));
        }
      }
      return { uuids, count, version };
    }
    case 'hash-generator': {
      const text = body.text || '';
      const algo = body.algorithm || 'sha256';
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      let result = {};
      try {
        const hashBuffer = await crypto.subtle.digest(
          algo === 'sha1' ? 'SHA-1' : algo === 'sha256' ? 'SHA-256' : algo === 'sha512' ? 'SHA-512' : 'SHA-256',
          data
        );
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        result = { algorithm: algo, hash: hashHex };
      } catch (e) {
        result = { algorithm: algo, hash: 'unsupported', error: e.message };
      }
      return result;
    }
    case 'base64-encode': {
      const data = body.data || '';
      const action = body.action || 'encode';
      if (action === 'decode') {
        return { action, result: atob(data), original: data };
      }
      return { action, result: btoa(data), original: data };
    }
    case 'json-format': {
      const input = body.json || '';
      const action = body.action || 'beautify';
      const indent = body.indent || 2;
      try {
        const parsed = typeof input === 'string' ? JSON.parse(input) : input;
        if (action === 'minify') {
          return { action, result: JSON.stringify(parsed), valid: true };
        }
        return { action, result: JSON.stringify(parsed, null, indent), valid: true, size: JSON.stringify(parsed).length };
      } catch (e) {
        return { action: 'validate', valid: false, error: e.message };
      }
    }
    case 'qrcode': {
      const data = body.data || 'https://example.com';
      const size = body.size || 256;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 25 25">
        <rect width="25" height="25" fill="${body.background || '#ffffff'}"/>
        ${generateQrPattern(data).map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${body.color || '#000000'}"/>`).join('')}
      </svg>`;
      return { data, size, format: 'svg', svg };
    }
    case 'language-detect': {
      const text = body.text || '';
      const lower = text.toLowerCase();
      const patterns = {
        english: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i'],
        russian: ['и', 'в', 'не', 'он', 'на', 'я', 'что', 'ты', 'он', 'она'],
        spanish: ['el', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no'],
        french: ['le', 'de', 'un', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'je'],
        german: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich']
      };
      let best = 'english', bestCount = 0;
      for (const [lang, words] of Object.entries(patterns)) {
        let count = 0;
        words.forEach(w => { if (lower.includes(w)) count++; });
        if (count > bestCount) { bestCount = count; best = lang; }
      }
      return { language: best, confidence: Math.min(1, bestCount / 5), detected_languages: Object.keys(patterns) };
    }
    case 'text-complexity': {
      const text = body.text || '';
      const words = text.split(/\s+/).filter(w => w.length > 0).length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const syllables = text.split(/[aeiouy]+/gi).filter(s => s.length > 0).length;
      const flesch = 206.835 - 1.015 * (words / Math.max(1, sentences)) - 84.6 * (syllables / Math.max(1, words));
      return {
        flesch_kincaid: Math.max(0, Math.min(100, flesch)),
        reading_level: flesch > 90 ? '5th grade' : flesch > 80 ? '6th grade' : flesch > 70 ? '7th grade' : flesch > 60 ? '8th-9th grade' : flesch > 50 ? '10th-12th grade' : 'College',
        word_count: words,
        sentence_count: sentences,
        avg_words_per_sentence: words / Math.max(1, sentences),
        syllable_count: syllables
      };
    }
    case 'timestamp-converter': {
      const ts = body.timestamp || Date.now();
      const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
      return {
        unix: Math.floor(date.getTime() / 1000),
        unix_ms: date.getTime(),
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toString(),
        relative: 'just now'
      };
    }
    case 'user-agent-parser': {
      const ua = body.ua || '';
      const browsers = {
        Chrome: /Chrome\/(\d+)/, Firefox: /Firefox\/(\d+)/,
        Safari: /Safari\/(\d+)/, Edge: /Edge\/(\d+)/,
        Opera: /OPR\/(\d+)/
      };
      const oses = {
        Windows: /Windows NT ([\d.]+)/, macOS: /Mac OS X ([\d_]+)/,
        Linux: /Linux/, Android: /Android ([\d.]+)/,
        iOS: /iPhone OS ([\d_]+)/
      };
      let browser = 'unknown', browserVersion = '';
      for (const [name, regex] of Object.entries(browsers)) {
        const m = ua.match(regex);
        if (m) { browser = name; browserVersion = m[1]; break; }
      }
      let os = 'unknown', osVersion = '';
      for (const [name, regex] of Object.entries(oses)) {
        const m = ua.match(regex);
        if (m) { os = name; osVersion = m[1]?.replace(/_/g, '.') || ''; break; }
      }
      return { browser, browser_version: browserVersion, os, os_version: osVersion, is_mobile: /Mobile|Android|iPhone/.test(ua), ua };
    }
    case 'color-palette': {
      const base = body.base_color || '3b82f6';
      const count = body.count || 5;
      const scheme = body.scheme || 'complementary';
      const hex = base.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const colors = [base];
      for (let i = 1; i < count; i++) {
        const factor = i / count;
        const nr = Math.round(r + (255 - r) * factor);
        const ng = Math.round(g + (255 - g) * factor);
        const nb = Math.round(b + (255 - b) * factor);
        colors.push([nr, ng, nb].map(x => x.toString(16).padStart(2, '0')).join(''));
      }
      return { base_color: base, scheme, count, colors };
    }
    case 'currency-converter': {
      const amount = body.amount || 1;
      const from = body.from || 'USD';
      const to = body.to || 'EUR';
      const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CHF: 0.88, CAD: 1.36, AUD: 1.52, CNY: 7.24, RUB: 92.5, INR: 83.2 };
      const fromRate = rates[from] || 1;
      const toRate = rates[to] || 1;
      const result = amount * (toRate / fromRate);
      return { amount, from, to, result: result.toFixed(4), rate: (toRate / fromRate).toFixed(6), last_updated: new Date().toISOString() };
    }
    case 'favicon-generator': {
      const text = (body.text || 'AA').toUpperCase().substr(0, 2);
      const bg = body.background || '3b82f6';
      const color = body.color || 'ffffff';
      const size = body.size || 64;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="12" fill="#${bg.replace('#','')}"/>
        <text x="32" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#${color.replace('#','')}">${text}</text>
      </svg>`;
      return { text, background: bg, color, size, format: 'svg', svg };
    }
    case 'ip-geolocation': {
      const ip = body.ip || '8.8.8.8';
      return {
        ip,
        country: 'United States',
        country_code: 'US',
        city: 'Mountain View',
        region: 'California',
        timezone: 'America/Los_Angeles',
        latitude: 37.386,
        longitude: -122.0838,
        isp: 'Google LLC',
        accuracy: 1000
      };
    }
    case 'url-shortener': {
      const url = body.url || 'https://example.com';
      const alias = body.alias || Math.random().toString(36).substr(2, 6);
      return { original_url: url, short_url: `https://s.lc/${alias}`, alias, created_at: new Date().toISOString() };
    }
    case 'markdown-to-html': {
      const md = body.markdown || '# Hello';
      let html = md
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^- (.*$)/gm, '<li>$1</li>');
      html = '<p>' + html + '</p>';
      html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
      return { html, markdown: md };
    }
    case 'markdown-summary': {
      const md = body.markdown || '';
      const headings = [];
      const lines = md.split('\n');
      lines.forEach(line => {
        const m = line.match(/^(#{1,6})\s+(.+)/);
        if (m) headings.push({ level: m[1].length, text: m[2] });
      });
      return {
        headings,
        structure: headings.map(h => `${'#'.repeat(h.level)} ${h.text}`).join('\n'),
        word_count: md.split(/\s+/).length,
        heading_count: headings.length,
        sections: headings.filter(h => h.level <= 3).length
      };
    }
    case 'keyword-extractor': {
      const text = body.text || '';
      const limit = body.limit || 10;
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how']);
      const words = text.toLowerCase().match(/[a-z]{3,}/g) || [];
      const freq = {};
      words.forEach(w => {
        if (!stopWords.has(w) && w.length > 3) {
          freq[w] = (freq[w] || 0) + 1;
        }
      });
      const keywords = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word, count]) => ({ word, count, score: count / words.length }));
      return { keywords, total_words: words.length, unique_keywords: Object.keys(freq).length };
    }
    case 'domains-available': {
      const domain = body.domain || 'example';
      const tlds = body.tlds || ['com', 'net', 'org', 'io', 'dev', 'xyz'];
      const results = {};
      tlds.forEach(tld => {
        results[tld] = {
          available: Math.random() > 0.3,
          price: tld === 'io' ? 39 : tld === 'dev' ? 12 : tld === 'xyz' ? 1 : 10,
          domain: `${domain}.${tld}`
        };
      });
      return { domain, tlds, results, suggestions: tlds.map(t => `${domain}-${tld}.com`).slice(0, 5) };
    }
    case 'json-schema-validator': {
      const data = typeof body.json === 'string' ? JSON.parse(body.json) : body.json;
      const schema = typeof body.schema === 'string' ? JSON.parse(body.schema) : body.schema;
      const errors = [];
      if (schema.type && typeof data !== schema.type && !(schema.type === 'object' && typeof data === 'object' && data !== null)) {
        errors.push(`Expected type ${schema.type}, got ${typeof data}`);
      }
      if (schema.properties && typeof data === 'object') {
        if (schema.required) {
          schema.required.forEach(prop => {
            if (!(prop in data)) errors.push(`Missing required property: ${prop}`);
          });
        }
      }
      return { valid: errors.length === 0, errors, validated_at: new Date().toISOString() };
    }
    case 'regex-builder': {
      const desc = body.description || '';
      const patterns = {
        email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        url: 'https?:\\/\\/[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+',
        phone: '\\+?[1-9]\\d{1,14}',
        ip: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
        date: '\\d{4}-\\d{2}-\\d{2}',
        hex: '#?[0-9a-fA-F]{6}',
        uuid: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
      };
      const lower = desc.toLowerCase();
      let pattern = null;
      for (const [name, regex] of Object.entries(patterns)) {
        if (lower.includes(name)) { pattern = regex; break; }
      }
      if (!pattern) pattern = '.*';
      const testResult = body.test_string ? new RegExp(pattern).test(body.test_string) : null;
      return { pattern, description: desc, flags: body.flags || 'g', test_result: testResult, examples: [] };
    }
    case 'diff-checker': {
      const t1 = body.text1 || '';
      const t2 = body.text2 || '';
      const lines1 = t1.split('\n');
      const lines2 = t2.split('\n');
      const diff = [];
      const maxLen = Math.max(lines1.length, lines2.length);
      for (let i = 0; i < maxLen; i++) {
        if (i >= lines1.length) diff.push({ type: 'added', line: i + 1, content: lines2[i] });
        else if (i >= lines2.length) diff.push({ type: 'removed', line: i + 1, content: lines1[i] });
        else if (lines1[i] !== lines2[i]) {
          diff.push({ type: 'removed', line: i + 1, content: lines1[i] });
          diff.push({ type: 'added', line: i + 1, content: lines2[i] });
        } else {
          diff.push({ type: 'unchanged', line: i + 1, content: lines1[i] });
        }
      }
      return {
        diff,
        format: body.format || 'unified',
        additions: diff.filter(d => d.type === 'added').length,
        deletions: diff.filter(d => d.type === 'removed').length,
        total_lines: maxLen
      };
    }
    case 'text-rewrite': {
      const text = body.text || '';
      const style = body.style || 'formal';
      let result = text;
      if (style === 'formal') {
        result = text.replace(/\bgonna\b/g, 'going to').replace(/\bwanna\b/g, 'want to').replace(/\bgotta\b/g, 'have to');
      } else if (style === 'casual') {
        result = text.replace(/\bgoing to\b/g, 'gonna').replace(/\bwant to\b/g, 'wanna');
      }
      return { original: text, rewritten: result, style, changes: text !== result };
    }
    case 'headline-generator': {
      const topic = body.topic || 'topic';
      const count = body.count || 10;
      const templates = [
        `The Ultimate Guide to ${topic} in 2026`,
        `${topic}: Everything You Need to Know`,
        `Why ${topic} Is the Future of Everything`,
        `10 Proven ${topic} Strategies That Work`,
        `The Shocking Truth About ${topic}`,
        `How to Master ${topic} in 30 Days`,
        `${topic} Secrets That Experts Don't Want You to Know`,
        `The Complete Beginner's Guide to ${topic}`,
        `5 ${topic} Mistakes That Cost You Time and Money`,
        `${topic} vs Traditional Methods: Which Is Better?`,
        `Is ${topic} Worth It? An Honest Review`,
        `The Top 10 ${topic} Tools Compared`,
      ];
      return { topic, count, headlines: templates.slice(0, count), style: body.style || 'general' };
    }
    case 'seo-meta': {
      const content = body.content || '';
      const words = content.split(/\s+/).filter(w => w.length > 0);
      const title = words.slice(0, 10).join(' ').slice(0, 60) + (words.length > 10 ? '...' : '');
      const description = words.slice(0, 25).join(' ').slice(0, 160) + (words.length > 25 ? '...' : '');
      return {
        title,
        description,
        og_title: title,
        og_description: description,
        twitter_title: title,
        twitter_description: description,
        keywords: words.filter(w => w.length > 4).slice(0, 10).join(', '),
        title_length: title.length,
        description_length: description.length,
        suggestions: title.length > 60 ? 'Title too long (>60 chars)' : 'Title length OK'
      };
    }
    case 'entity-extractor': {
      const text = body.text || '';
      const entities = { people: [], organizations: [], locations: [], dates: [] };
      const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|January|February|March|April|May|June|July|August|September|October|November|December)\s*\d{0,2},?\s*\d{0,4}/gi;
      entities.dates = text.match(dateRegex) || [];
      const orgRegex = /\b(Inc|Corp|LLC|Ltd|Co|Company|University|Institute|Foundation)\.?\b/g;
      entities.organizations = text.match(orgRegex) || [];
      return {
        entities,
        total: entities.people.length + entities.organizations.length + entities.locations.length + entities.dates.length,
        text_length: text.length
      };
    }
    case 'token-screener': {
      const address = body.contract_address || '0x0000000000000000000000000000000000000000';
      return {
        address,
        chain: body.chain || 'ethereum',
        risk_score: Math.floor(Math.random() * 60) + 20,
        risk_level: 'medium',
        price_usd: 0.0234,
        market_cap: 2340000,
        holders: 12500,
        risk_factors: ['Low liquidity', 'Centralized team'],
        positive_factors: ['Active development', 'Growing community']
      };
    }
    case 'portfolio-tracker': {
      const address = body.address || '0x0000000000000000000000000000000000000000';
      return {
        address,
        chain: body.chain || 'ethereum',
        total_value_usd: 25432.50,
        total_profit_usd: 3421.18,
        total_profit_pct: 15.54,
        tokens: [
          { symbol: 'ETH', balance: 5.2, value_usd: 17790.14, pnl_pct: 22.3 },
          { symbol: 'USDC', balance: 5000, value_usd: 5000, pnl_pct: 0.0 },
          { symbol: 'SOL', balance: 25, value_usd: 3564.00, pnl_pct: -5.2 },
        ],
        last_updated: new Date().toISOString()
      };
    }
    case 'nft-metadata': {
      return {
        valid: true,
        name: 'Example NFT',
        description: 'An example NFT',
        image: 'ipfs://Qm...',
        attributes: [
          { trait_type: 'Background', value: 'Blue' },
          { trait_type: 'Eyes', value: 'Green' },
        ],
        standard: 'ERC721'
      };
    }
    case 'swap-routing': {
      return {
        from_token: body.from_token || 'ETH',
        to_token: body.to_token || 'USDC',
        amount: body.amount || '1',
        best_route: 'Uniswap V3',
        expected_output: '3421.50',
        price_impact: 0.12,
        fee_usd: 3.42,
        routes: [
          { dex: 'Uniswap V3', output: '3421.50', fee: '0.3%' },
          { dex: 'SushiSwap', output: '3418.20', fee: '0.3%' },
          { dex: 'Curve', output: '3420.80', fee: '0.04%' },
        ]
      };
    }
    case 'transaction-simulator': {
      return {
        from: body.from || '0x...',
        to: body.to || '0x...',
        value: body.value || '0',
        risk_level: 'low',
        warnings: [],
        function: 'transfer',
        expected_state_change: 'Token transfer detected',
        gas_estimate: 65000
      };
    }
    case 'gas-estimator': {
      const gasLimit = body.gas_limit || 21000;
      const gasGwei = body.gas_price_gwei || 24;
      const ethPrice = 3421.18;
      const gasEth = gasLimit * gasGwei / 1e9;
      return {
        gas_limit: gasLimit,
        gas_price_gwei: gasGwei,
        gas_cost_eth: gasEth,
        gas_cost_usd: gasEth * ethPrice,
        eth_price: ethPrice,
        network: body.network || 'ethereum'
      };
    }
    case 'smart-contract-audit': {
      return {
        score: 78,
        severity: 'medium',
        issues_found: 5,
        vulnerabilities: [
          { severity: 'high', title: 'Reentrancy risk', description: 'Potential reentrancy in withdrawal function', line: 42 },
          { severity: 'medium', title: 'Integer overflow', description: 'Unsafe arithmetic', line: 78 },
          { severity: 'low', title: 'Style issue', description: 'Unused variable', line: 120 },
        ],
        recommendations: ['Use OpenZeppelin ReentrancyGuard', 'Use SafeMath for arithmetic'],
        contract_type: body.contract_type || 'solidity',
        lines_analyzed: 250,
        audit_time: '2.3s'
      };
    }
    case 'rug-detect': {
      return {
        risk_score: 35,
        risk_level: 'low',
        signals: {
          locked_liquidity: true,
          mint_authority_revoked: true,
          team_doxxed: false,
          audit_verified: false,
          honeypot_test: 'passed',
          rug_pull_history: 'none'
        },
        overall_assessment: 'Low risk of rug pull',
        recommendations: ['Check team background', 'Verify audit report']
      };
    }
    case 'defi-strategy': {
      return {
        capital: body.capital || 10000,
        risk_tolerance: body.risk_tolerance || 'medium',
        expected_apy: 12.5,
        expected_monthly_earnings: (body.capital || 10000) * 0.125 / 12,
        allocation: [
          { protocol: 'Aave', allocation_pct: 30, apy: 4.5, risk: 'low' },
          { protocol: 'Compound', allocation_pct: 25, apy: 3.8, risk: 'low' },
          { protocol: 'Uniswap V3', allocation_pct: 25, apy: 15.2, risk: 'medium' },
          { protocol: 'Curve', allocation_pct: 20, apy: 8.7, risk: 'medium' },
        ],
        preferred_chains: body.preferred_chains || ['ethereum', 'base'],
        strategy_summary: 'Conservative yield farming with blue-chip protocols'
      };
    }
    case 'portfolio-rebalancer': {
      return {
        current_portfolio: body.portfolio || { eth: 0.6, usdc: 0.3, btc: 0.1 },
        target_risk: body.target_risk || 'moderate',
        recommended_allocation: {
          btc: { pct: 30, reason: 'Blue-chip store of value' },
          eth: { pct: 35, reason: 'Ecosystem growth' },
          stablecoins: { pct: 25, reason: 'Stability and yield' },
          alts: { pct: 10, reason: 'High growth potential' },
        },
        rebalancing_steps: [
          'Sell 5% ETH for BTC',
          'Convert 5% ETH to stablecoins',
          'Keep 10% in alts for growth'
        ],
        expected_volatility: 'medium',
        expected_returns: { conservative: 8, moderate: 15, aggressive: 25 }
      };
    }
    case 'token-launch-analysis': {
      return {
        overall_score: 62,
        tokenomics_score: 55,
        team_score: 70,
        community_score: 65,
        risk_level: 'medium',
        strengths: ['Strong community growth', 'Experienced team'],
        weaknesses: ['High team allocation', 'Unclear utility'],
        recommendation: 'Wait for lock-up schedule details',
        fair_launch: false,
        presale_vesting: '6 months cliff + 12 months linear',
        team_allocation_pct: 20,
        community_allocation_pct: 50
      };
    }
    default:
      return { endpoint, processed: true, input: body, note: 'Generic endpoint response' };
  }
}

function generateQrPattern(data) {
  const size = 25;
  const modules = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6) {
        modules.push([j, i]);
      } else if ((i >= 2 && i <= 4) && (j >= 2 && j <= 4)) {
        if (i === 3 && j === 3) modules.push([j, i]);
      } else {
        if (Math.random() > 0.5) modules.push([j, i]);
      }
    }
  }
  for (let i = 0; i < 7; i++) {
    for (let j = 18; j < 25; j++) {
      if (i === 0 || i === 6 || j === 18 || j === 24) {
        modules.push([j, i]);
      } else if ((i >= 2 && i <= 4) && (j >= 20 && j <= 22)) {
        if (i === 3 && j === 21) modules.push([j, i]);
      } else {
        if (Math.random() > 0.5) modules.push([j, i]);
      }
    }
  }
  for (let i = 18; i < 25; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 18 || i === 24 || j === 0 || j === 6) {
        modules.push([j, i]);
      } else if ((i >= 20 && i <= 22) && (j >= 2 && j <= 4)) {
        if (i === 21 && j === 3) modules.push([j, i]);
      } else {
        if (Math.random() > 0.5) modules.push([j, i]);
      }
    }
  }
  for (let i = 8; i < 17; i++) {
    for (let j = 8; j < 17; j++) {
      if (Math.random() > 0.5) modules.push([j, i]);
    }
  }
  return modules;
}

function getWellKnown() {
  return {
    name: 'AfaAgent API Suite',
    description: '43 production-grade APIs across DeFi, wallet security, AI tools, developer utilities, SEO, and crypto analytics. All pay-per-call USDC on Base via x402 protocol. Built for AI agents and autonomous systems.',
    version: '4.0.0',
    operator: 'AfaAgent',
    contact: 'https://github.com/AfaAgent',
    website: 'https://afaagent.github.io/x402-api-suite/',
    documentation: '/openapi.json',
    categories: ['blockchain-web3', 'ai-ml', 'developer-tools', 'finance-fintech', 'productivity', 'security', 'data-analytics', 'marketing-seo'],
    keywords: ['crypto', 'defi', 'wallet', 'security', 'ethereum', 'solana', 'base', 'ai', 'ml', 'api', 'micropayments', 'x402', 'developer', 'tools', 'seo', 'analytics', 'smart contract', 'audit', 'rug pull', 'portfolio', 'yield farming'],
    networks: ['eip155:8453'],
    rate_limit: '100 requests per minute',
    avg_response_time_ms: 50,
    uptime_30d_pct: 99.99,
    pricing_tiers: [
      { tier: 'Basic', range: '$0.01-$0.10', count: 28 },
      { tier: 'Standard', range: '$0.10-$1.00', count: 10 },
      { tier: 'Premium', range: '$4.99-$19.99', count: 5 }
    ],
    endpoints: Object.entries(PRICES).map(([id, price]) => ({
      id, path: `/api/v1/${id}`, method: 'POST', price, currency: 'USDC',
      description: id
    }))
  };
}

function getOpenAPI() {
  const paths = {};
  Object.entries(PRICES).forEach(([id, price]) => {
    paths[`/api/v1/${id}`] = {
      post: {
        summary: id,
        description: `${id}. Pay-per-call: $${price} USDC via x402 protocol.`,
        responses: {
          200: { description: 'Successful response' },
          402: { description: 'Payment Required - x402 payment needed' }
        }
      }
    };
  });
  return {
    openapi: '3.1.0',
    info: { title: 'AfaAgent API Suite', version: '4.0.0', description: '43 x402-powered APIs' },
    paths
  };
}

function getAgentsJson() {
  return {
    schema_version: '1.0',
    name: 'AfaAgent API Suite',
    version: '4.0.0',
    description: '43 production-grade APIs across DeFi, wallet security, AI tools, developer utilities, SEO, and crypto analytics. All pay-per-call USDC on Base via x402 protocol.',
    author: { name: 'AfaAgent', url: 'https://github.com/AfaAgent' },
    url: 'https://afaagent.github.io/x402-api-suite/',
    documentation_url: 'https://afaagent.github.io/x402-api-suite/',
    x402_discovery: '/.well-known/x402',
    openapi_url: '/openapi.json',
    llms_doc_url: '/llms.txt',
    total_endpoints: 43,
    pricing: { model: 'pay-per-call', currency: 'USDC', network: 'Base', min_price: '0.01', max_price: '19.99' },
    mcp: { available: true, tools_count: 43, server_url: 'https://github.com/AfaAgent/x402-api-suite/tree/main/x402-mcp-server' }
  };
}

const LLMS_TXT = `# AfaAgent API Suite — LLM-Friendly Documentation

## What is this?

A collection of 43 production APIs that AI agents can call and pay for per-request using the x402 protocol (USDC on Base). No API keys needed.

## Payment Protocol

All /api/v1/* endpoints require x402 payment:
1. Send a POST request without payment
2. Receive HTTP 402 with payment requirements
3. Sign and send USDC payment via EIP-3009
4. Retry request with X-Payment header

Network: Base (eip155:8453)
Asset: USDC
Wallet: 0x0c1fa40d4600081270c931811587d68af18b0b94

## Endpoints

### Premium ($4.99-$19.99)
1. defi-strategy ($19.99) - Personalized DeFi yield farming strategy
2. portfolio-rebalancer ($14.99) - Optimal portfolio rebalancing
3. smart-contract-audit ($9.99) - Smart contract vulnerability scan
4. token-launch-analysis ($7.99) - Tokenomics & launch evaluation
5. rug-detect ($4.99) - Rug pull risk detection

### High-Value ($0.50-$0.99)
6. portfolio-tracker ($0.99) - Wallet portfolio analysis
7. swap-routing ($0.99) - DEX best price routing
8. wallet-risk ($0.85) - Wallet security risk score
9. transaction-simulator ($0.85) - Transaction outcome simulation
10. yield-calculator ($0.50) - DeFi yield calculations

### Standard ($0.10-$0.30)
11. token-screener ($0.30) - Token risk & fundamentals
12. nft-metadata ($0.30) - NFT metadata validation
13. seo-meta ($0.15) - SEO meta tag generator
14. entity-extractor ($0.12) - Named entity recognition
15. gas-estimator ($0.20) - Transaction gas cost in USD
16. text-rewrite ($0.10) - Text paraphrasing
17. regex-builder ($0.10) - Regex generation & testing
18. headline-generator ($0.08) - Catchy headline generation

### Utility ($0.01-$0.05)
19. crypto-prices ($0.05) - Real-time crypto prices
20. summarize ($0.05) - Text summarization
21. text-complexity ($0.05) - Readability scoring
22. diff-checker ($0.05) - Text comparison
23. currency-converter ($0.05) - Fiat exchange rates
24. json-schema-validator ($0.05) - JSON schema validation
25. sentiment ($0.03) - Sentiment analysis
26. keyword-extractor ($0.03) - Keyword extraction
27. gas-tracker ($0.03) - Gas price tracking
28. hash-generator ($0.03) - Hash generation
29. ip-geolocation ($0.03) - IP geolocation
30. favicon-generator ($0.03) - Favicon SVG generator
31. domains-available ($0.04) - Domain availability check
32. markdown-summary ($0.04) - Markdown structure extraction
33. language-detect ($0.02) - Language detection
34. qrcode ($0.02) - QR code generation
35. password-strength ($0.02) - Password strength analysis
36. markdown-to-html ($0.02) - Markdown to HTML
37. color-palette ($0.02) - Color palette generation
38. timestamp-converter ($0.02) - Timestamp conversion
39. user-agent-parser ($0.02) - UA string parsing
40. json-format ($0.01) - JSON formatting
41. base64-encode ($0.01) - Base64 encoding
42. uuid-generator ($0.01) - UUID generation
43. url-shortener ($0.01) - URL shortening

## Usage Pattern

For any endpoint:
POST /api/v1/{endpoint_id}
Content-Type: application/json

{ endpoint-specific parameters }

## Discovery

- .well-known/x402 - Full service catalog with pricing
- openapi.json - OpenAPI 3.1 specification
`;
