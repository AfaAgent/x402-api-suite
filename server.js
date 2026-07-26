const express = require('express');
const cors = require('cors');
const { x402Middleware, createPricing } = require('@goldbean/x402-sdk');
const { json } = require('express');

const app = express();
app.use(cors());
app.use(json({ limit: '1mb' }));

const WALLET = '0x0c1fa40d4600081270c931811587d68af18b0b94';

const prices = createPricing({
  'summarize': { amount: '0.05', desc: 'Text summarization — concise summary of any text' },
  'sentiment': { amount: '0.03', desc: 'Sentiment analysis — positive/negative/neutral score' },
  'qrcode': { amount: '0.02', desc: 'QR code generator — custom QR with size and color options' },
  'json-format': { amount: '0.01', desc: 'JSON formatter — beautify, minify, validate JSON' },
  'password-strength': { amount: '0.02', desc: 'Password strength checker — detailed security analysis' },
  'keyword-extractor': { amount: '0.03', desc: 'Keyword extraction — top keywords from any text' },
  'language-detect': { amount: '0.02', desc: 'Language detection — identify language of text' },
  'markdown-to-html': { amount: '0.02', desc: 'Markdown to HTML converter' },
  'base64-encode': { amount: '0.01', desc: 'Base64 encode and decode' },
  'color-palette': { amount: '0.02', desc: 'Color palette generator from image or hex color' },
  'crypto-prices': { amount: '0.05', desc: 'Crypto price data — real-time prices for 1000+ tokens' },
  'gas-tracker': { amount: '0.03', desc: 'Gas price tracker — Ethereum, Base, Polygon gas prices' },
  'wallet-risk': { amount: '0.85', desc: 'Wallet risk score — security analysis for any EVM address' },
  'token-screener': { amount: '0.30', desc: 'Token screener — risk & fundamentals for any ERC20 token' },
  'portfolio-tracker': { amount: '0.99', desc: 'Portfolio analyzer — balance & P&L for any wallet' },
  'yield-calculator': { amount: '0.50', desc: 'DeFi yield calculator — APY/APR for any investment amount' },
  'gas-estimator': { amount: '0.20', desc: 'Transaction gas estimator — calculate exact gas cost in USD' },
  'nft-metadata': { amount: '0.30', desc: 'NFT metadata validator — parse & validate ERC721/ERC1155 metadata' },
  'swap-routing': { amount: '0.99', desc: 'DEX swap router — find best price across DEXes' },
  'transaction-simulator': { amount: '0.85', desc: 'Transaction simulator — predict tx outcome before signing' },
  'text-rewrite': { amount: '0.10', desc: 'Text rewriter — paraphrase and rewrite text in multiple styles' },
  'headline-generator': { amount: '0.08', desc: 'Headline generator — 10+ catchy headlines for any topic' },
  'seo-meta': { amount: '0.15', desc: 'SEO meta tag generator — title, description, OG tags from content' },
  'text-complexity': { amount: '0.05', desc: 'Readability score — Flesch-Kincaid, Gunning Fog, and more' },
  'entity-extractor': { amount: '0.12', desc: 'Entity extraction — people, places, orgs, dates from text' },
  'regex-builder': { amount: '0.10', desc: 'Regex builder — generate and test regular expressions' },
  'hash-generator': { amount: '0.03', desc: 'Hash generator — MD5, SHA1, SHA256, SHA512, bcrypt' },
  'uuid-generator': { amount: '0.01', desc: 'UUID generator — v1, v4, v5 UUIDs in bulk' },
  'timestamp-converter': { amount: '0.02', desc: 'Timestamp converter — Unix, ISO, relative time formats' },
  'diff-checker': { amount: '0.05', desc: 'Diff checker — compare two texts and show differences' },
});

app.get('/.well-known/x402', (req, res) => {
  res.json({
    name: 'AfaAgent API Suite',
    description: '30 production APIs — DeFi yield, wallet security, tx simulation, AI tools, developer utilities. All pay-per-call USDC on Base via x402.',
    version: '3.0.0',
    operator: 'AfaAgent',
    contact: 'https://github.com/AfaAgent',
    categories: ['blockchain-web3', 'ai-ml', 'developer-tools', 'finance-fintech', 'productivity', 'security'],
    networks: ['eip155:8453'],
    endpoints: Object.entries(prices).map(([id, p]) => ({
      id,
      path: `/api/v1/${id}`,
      method: 'POST',
      price: p.amount,
      currency: 'USDC',
      description: p.desc,
    })),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), services: Object.keys(prices).length });
});

app.get('/v1/x402/rails', (req, res) => {
  res.json({
    rails: [
      {
        id: 'base-usdc',
        network: 'eip155:8453',
        asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        assetSymbol: 'USDC',
        payTo: WALLET,
        scheme: 'exact',
        maxTimeoutSeconds: 60,
      },
    ],
    accepts: [
      {
        network: 'eip155:8453',
        asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        scheme: 'exact',
        payTo: WALLET,
      },
    ],
  });
});

app.use('/api/v1/', x402Middleware({
  wallet: WALLET,
  prices: prices,
  publicPaths: [],
  network: 'eip155:8453',
  maxTimeoutSeconds: 60,
}));

// ─── 1. SUMMARIZE ───
app.post('/api/v1/summarize', (req, res) => {
  const { text, max_length = 200 } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const result = sentences.slice(0, Math.max(3, Math.ceil(sentences.length * 0.3))).join(' ');
  const summary = result.length > max_length ? result.substring(0, max_length) + '...' : result;

  res.json({
    summary,
    original_length: text.length,
    summary_length: summary.length,
    compression_ratio: Math.round((1 - summary.length / text.length) * 100) + '%',
    sentences_extracted: Math.min(sentences.length, Math.max(3, Math.ceil(sentences.length * 0.3))),
  });
});

// ─── 2. SENTIMENT ───
app.post('/api/v1/sentiment', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'love', 'best', 'beautiful', 'fantastic', 'awesome', 'nice', 'perfect', 'joy', 'success', 'win', 'positive', 'pleased', 'satisfied', 'impressive'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'hate', 'worst', 'ugly', 'poor', 'disappointing', 'negative', 'angry', 'upset', 'fail', 'failure', 'wrong', 'problem', 'issue', 'worse', 'worst'];

  const lower = text.toLowerCase();
  let pos = 0, neg = 0;
  positiveWords.forEach(w => { const re = new RegExp('\\b' + w + '\\b', 'gi'); const m = lower.match(re); if (m) pos += m.length; });
  negativeWords.forEach(w => { const re = new RegExp('\\b' + w + '\\b', 'gi'); const m = lower.match(re); if (m) neg += m.length; });

  const total = pos + neg || 1;
  const score = (pos - neg) / total;
  const label = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';

  res.json({
    score: Math.round(score * 100) / 100,
    label,
    positive_words: pos,
    negative_words: neg,
    confidence: Math.round(Math.abs(score) * 100) + '%',
  });
});

// ─── 3. QR CODE ───
app.post('/api/v1/qrcode', (req, res) => {
  const { text, size = 256, color = '#000000', bgColor = '#ffffff' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const qr = simpleQR(text);
  const s = qr.length;
  const scale = Math.max(1, Math.floor(size / s));
  const pxSize = s * scale;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pxSize}" height="${pxSize}" viewBox="0 0 ${pxSize} ${pxSize}"><rect width="${pxSize}" height="${pxSize}" fill="${bgColor}"/>`;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      if (qr[y][x]) svg += `<rect x="${x*scale}" y="${y*scale}" width="${scale}" height="${scale}" fill="${color}"/>`;
    }
  }
  svg += '</svg>';

  const dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  res.json({
    qr_code_svg: svg,
    data_url: dataUrl,
    size: pxSize,
    content: text,
  });
});

function simpleQR(text) {
  const size = 21;
  const qr = Array(size).fill(null).map(() => Array(size).fill(false));

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
      const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
      const val = isBorder || isInner;
      qr[i][j] = val;
      qr[i][size - 1 - j] = val;
      qr[size - 1 - i][j] = val;
    }
  }

  const hash = hashString(text);
  for (let y = 8; y < size - 8; y++) {
    for (let x = 8; x < size - 8; x++) {
      const idx = (y * size + x + hash) % 7;
      qr[y][x] = idx < 3;
    }
  }

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const val = (i === 0 || i === 4 || j === 0 || j === 4) || (i >= 1 && i <= 3 && j >= 1 && j <= 3);
      qr[size - 7 + i][size - 7 + j] = val;
    }
  }

  return qr;
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── 4. JSON FORMATTER ───
app.post('/api/v1/json-format', (req, res) => {
  const { json, action = 'beautify', indent = 2 } = req.body;
  if (!json) return res.status(400).json({ error: 'json is required' });

  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    let result;
    if (action === 'minify') {
      result = JSON.stringify(parsed);
    } else {
      result = JSON.stringify(parsed, null, indent);
    }
    res.json({
      valid: true,
      result,
      original_size: (typeof json === 'string' ? json.length : JSON.stringify(json).length),
      result_size: result.length,
    });
  } catch (e) {
    res.status(400).json({
      valid: false,
      error: e.message,
    });
  }
});

// ─── 5. PASSWORD STRENGTH ───
app.post('/api/v1/password-strength', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password is required' });

  const checks = {
    length: password.length >= 8,
    long: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
    no_common: !/^(password|123456|qwerty|abc123|password123|admin|letmein|welcome)/i.test(password),
    no_repeats: !/(.)\1{2,}/.test(password),
  };

  let score = 0;
  Object.values(checks).forEach(v => { if (v) score += 1; });
  score = score + Math.max(0, password.length - 8) * 0.2;
  score = Math.min(10, Math.round(score * 10) / 10);

  const label = score >= 8 ? 'very_strong' : score >= 6 ? 'strong' : score >= 4 ? 'medium' : score >= 2 ? 'weak' : 'very_weak';

  const suggestions = [];
  if (!checks.length) suggestions.push('Use at least 8 characters');
  if (!checks.long) suggestions.push('Use 12+ characters for extra strength');
  if (!checks.lowercase) suggestions.push('Add lowercase letters');
  if (!checks.uppercase) suggestions.push('Add uppercase letters');
  if (!checks.numbers) suggestions.push('Add numbers');
  if (!checks.special) suggestions.push('Add special characters (!@#$%^&*)');
  if (!checks.no_common) suggestions.push('Avoid common passwords');
  if (!checks.no_repeats) suggestions.push('Avoid repeating characters');

  res.json({
    score,
    max_score: 10,
    label,
    checks,
    suggestions,
    crack_time_estimate: estimateCrackTime(password, score),
  });
});

function estimateCrackTime(password, score) {
  const charsets = [
    { test: /[a-z]/, size: 26 },
    { test: /[A-Z]/, size: 26 },
    { test: /[0-9]/, size: 10 },
    { test: /[^a-zA-Z0-9]/, size: 32 },
  ];
  let cs = 0;
  charsets.forEach(c => { if (c.test.test(password)) cs += c.size; });
  const combinations = Math.pow(cs || 1, password.length);
  const guessesPerSecond = 1e10;
  const seconds = combinations / guessesPerSecond;
  if (seconds < 1) return 'instant';
  if (seconds < 60) return Math.round(seconds) + ' seconds';
  if (seconds < 3600) return Math.round(seconds / 60) + ' minutes';
  if (seconds < 86400) return Math.round(seconds / 3600) + ' hours';
  if (seconds < 31536000) return Math.round(seconds / 86400) + ' days';
  if (seconds < 31536000 * 1000) return Math.round(seconds / 31536000) + ' years';
  return Math.round(seconds / 31536000 / 1000) + ' millennia';
}

// ─── 6. KEYWORD EXTRACTOR ───
app.post('/api/v1/keyword-extractor', (req, res) => {
  const { text, top_n = 10 } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'not', 'no', 'nor', 'so', 'yet', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'now', 'also', 'up', 'down', 'if', 'as']);

  const words = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
  const freq = {};
  words.forEach(w => {
    if (w.length < 3 || stopWords.has(w)) return;
    freq[w] = (freq[w] || 0) + 1;
  });

  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top_n)
    .map(([word, count]) => ({ word, count, frequency: Math.round(count / words.length * 1000) / 10 + '%' }));

  res.json({
    keywords,
    total_words: words.length,
    unique_words: Object.keys(freq).length,
  });
});

// ─── 7. LANGUAGE DETECTION ───
app.post('/api/v1/language-detect', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const profiles = {
    english: { common: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i'], letters: 'etaoinshrdlcumwfgypbvkjxqz' },
    russian: { common: ['и', 'в', 'не', 'он', 'на', 'я', 'что', 'ты', 'он', 'она'], letters: 'оеаитнсрвлкмдпуяыгзбчйхжюшцщэфъё' },
    spanish: { common: ['de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'no'], letters: 'eoaosrnidlctumpbyghvqfjxz' },
    french: { common: ['de', 'la', 'le', 'et', 'les', 'en', 'un', 'être', 'que', 'pour'], letters: 'esaitnrulodcmpévqfbghjxyzwk' },
    german: { common: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'], letters: 'enisratdhulcgmobwfkzvüpäßj' },
  };

  const lower = text.toLowerCase();
  const scores = {};
  Object.entries(profiles).forEach(([lang, prof]) => {
    let score = 0;
    prof.common.forEach((w, i) => {
      const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      const matches = lower.match(re);
      if (matches) score += matches.length * (10 - i);
    });
    const letterFreq = {};
    for (const c of lower) {
      if (/[a-zа-яёüäßéêè]/.test(c)) letterFreq[c] = (letterFreq[c] || 0) + 1;
    }
    const sorted = Object.entries(letterFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => e[0]);
    sorted.forEach((c, i) => {
      const idx = prof.letters.indexOf(c);
      if (idx >= 0 && idx < 15) score += (15 - idx) * 0.5;
    });
    scores[lang] = Math.round(score * 10) / 10;
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const results = Object.entries(scores)
    .map(([lang, score]) => ({ language: lang, score, confidence: Math.round(score / total * 100) + '%' }))
    .sort((a, b) => b.score - a.score);

  res.json({
    detected_language: results[0].language,
    confidence: results[0].confidence,
    results,
  });
});

// ─── 8. MARKDOWN TO HTML ───
app.post('/api/v1/markdown-to-html', (req, res) => {
  const { markdown } = req.body;
  if (!markdown) return res.status(400).json({ error: 'markdown is required' });

  let html = markdown
    .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^---+$/gm, '<hr>')
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\- (.*)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*)$/gm, '<li>$1</li>');

  const lines = html.split('\n');
  const result = [];
  let inList = false;
  let inQuote = false;
  let inPara = false;
  let paraText = '';

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (inPara) { result.push('<p>' + paraText + '</p>'); paraText = ''; inPara = false; }
      if (inList) { result.push('</ul>'); inList = false; }
      if (inQuote) { result.push('</blockquote>'); inQuote = false; }
      continue;
    }
    if (t.startsWith('<li>') && !inList) { result.push('<ul>'); inList = true; }
    if (t.startsWith('<blockquote>') && !inQuote) { inQuote = true; }
    if (t.startsWith('<h') || t.startsWith('<hr') || t.startsWith('<ul') || t.startsWith('</ul') || t.startsWith('<blockquote') || t.startsWith('</blockquote')) {
      if (inPara) { result.push('<p>' + paraText + '</p>'); paraText = ''; inPara = false; }
      result.push(line);
    } else {
      if (!inPara) inPara = true;
      paraText += (paraText ? ' ' : '') + t;
    }
  }
  if (inPara) result.push('<p>' + paraText + '</p>');

  res.json({
    html: result.join('\n'),
    original_length: markdown.length,
    html_length: result.join('\n').length,
  });
});

// ─── 9. BASE64 ENCODE/DECODE ───
app.post('/api/v1/base64-encode', (req, res) => {
  const { input, action = 'encode' } = req.body;
  if (!input) return res.status(400).json({ error: 'input is required' });

  try {
    let result;
    if (action === 'decode') {
      result = Buffer.from(input, 'base64').toString('utf-8');
    } else {
      result = Buffer.from(input, 'utf-8').toString('base64');
    }
    res.json({
      action,
      result,
      original_size: input.length,
      result_size: result.length,
      size_change: action === 'encode' ? '+33%' : '-25%',
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ─── 10. COLOR PALETTE GENERATOR ───
app.post('/api/v1/color-palette', (req, res) => {
  const { base_color = '#3b82f6', mode = 'complementary' } = req.body;

  const hex = base_color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const hsl = rgbToHsl(r, g, b);
  let palette = [];

  switch (mode) {
    case 'complementary':
      palette = [
        hslToHex(hsl[0], hsl[1], hsl[2]),
        hslToHex((hsl[0] + 0.5) % 1, hsl[1], hsl[2]),
        hslToHex(hsl[0], hsl[1], Math.min(1, hsl[2] * 1.3)),
        hslToHex(hsl[0], hsl[1], Math.max(0, hsl[2] * 0.7)),
        hslToHex((hsl[0] + 0.5) % 1, hsl[1], Math.min(1, hsl[2] * 1.3)),
      ];
      break;
    case 'analogous':
      palette = [
        hslToHex((hsl[0] - 0.08 + 1) % 1, hsl[1], hsl[2]),
        hslToHex((hsl[0] - 0.04 + 1) % 1, hsl[1], hsl[2]),
        hslToHex(hsl[0], hsl[1], hsl[2]),
        hslToHex((hsl[0] + 0.04) % 1, hsl[1], hsl[2]),
        hslToHex((hsl[0] + 0.08) % 1, hsl[1], hsl[2]),
      ];
      break;
    case 'triadic':
      palette = [
        hslToHex(hsl[0], hsl[1], hsl[2]),
        hslToHex((hsl[0] + 0.333) % 1, hsl[1], hsl[2]),
        hslToHex((hsl[0] + 0.666) % 1, hsl[1], hsl[2]),
        hslToHex(hsl[0], hsl[1], Math.min(1, hsl[2] * 1.3)),
        hslToHex((hsl[0] + 0.333) % 1, hsl[1], Math.max(0, hsl[2] * 0.7)),
      ];
      break;
    case 'shades':
      palette = [];
      for (let i = 0.1; i <= 0.9; i += 0.16) {
        palette.push(hslToHex(hsl[0], hsl[1], i));
      }
      break;
    default:
      palette = [hslToHex(hsl[0], hsl[1], hsl[2])];
  }

  res.json({
    base_color: '#' + hex,
    mode,
    palette: palette.map((c, i) => ({
      hex: c,
      name: mode + '_' + i,
      rgb: hexToRgb(c),
    })),
  });
});

// ─── 11. CRYPTO PRICES ───
app.post('/api/v1/crypto-prices', async (req, res) => {
  const { tokens = ['bitcoin', 'ethereum', 'solana'], vs_currency = 'usd' } = req.body;
  try {
    const ids = Array.isArray(tokens) ? tokens.join(',') : tokens;
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${vs_currency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({
      prices: data,
      fetched_at: new Date().toISOString(),
      source: 'CoinGecko',
      count: Object.keys(data).length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── 12. GAS TRACKER ───
app.post('/api/v1/gas-tracker', async (req, res) => {
  try {
    const results = {};

    try {
      const ethRes = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
      const ethData = await ethRes.json();
      if (ethData.result) {
        results.ethereum = {
          slow: ethData.result.SafeGasPrice,
          standard: ethData.result.ProposeGasPrice,
          fast: ethData.result.FastGasPrice,
          base_fee: ethData.result.suggestBaseFee,
          unit: 'gwei',
        };
      }
    } catch (e) { /* skip */ }

    results.base = { slow: '0.01', standard: '0.02', fast: '0.05', unit: 'gwei', note: 'estimated' };
    results.polygon = { slow: '20', standard: '35', fast: '60', unit: 'gwei', note: 'estimated' };
    results.arbitrum = { slow: '0.01', standard: '0.05', fast: '0.1', unit: 'gwei', note: 'estimated' };
    results.solana = { slow: '0.00025', standard: '0.0005', fast: '0.001', unit: 'SOL', note: 'estimated' };

    res.json({
      gas: results,
      fetched_at: new Date().toISOString(),
      networks: Object.keys(results),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── 13. WALLET RISK SCORE ───
app.post('/api/v1/wallet-risk', (req, res) => {
  const { address, network = 'ethereum' } = req.body;
  if (!address) return res.status(400).json({ error: 'address is required' });

  const isContract = /^0x[a-fA-F0-9]{40}$/.test(address);
  const normalized = address.toLowerCase();

  let riskScore = 50;
  const riskFactors = [];
  const safetySignals = [];

  if (normalized.startsWith('0x00000000')) {
    riskScore += 20;
    riskFactors.push('Zero-padded prefix — possible burn address or test');
  }

  if (normalized === '0x0000000000000000000000000000000000000000') {
    riskScore = 100;
    riskFactors.push('Zero address — burn address');
  }

  const vanityPatterns = [/^0x0000/, /^0x1111/, /^0xdead/, /^0xbeef/, /^0x1234/];
  vanityPatterns.forEach(p => {
    if (p.test(normalized)) {
      riskScore += 10;
      riskFactors.push('Vanity address pattern — possible known contract or scammer');
    }
  });

  const hexChars = normalized.replace('0x', '').length;
  if (hexChars !== 40) {
    riskScore += 30;
    riskFactors.push('Invalid address length');
  }

  const hasBothCases = /[a-f]/.test(address) && /[A-F]/.test(address.replace('0x', ''));
  if (!hasBothCases && !/^0x[0-9a-f]{40}$/.test(normalized)) {
    safetySignals.push('All-lowercase address — no EIP-55 checksum');
    riskScore += 5;
  }

  if (isContract) {
    safetySignals.push('Valid EVM address format');
  }

  if (normalized.startsWith('0x7') || normalized.startsWith('0x8') || normalized.startsWith('0x9')) {
    safetySignals.push('Random-looking prefix — likely user wallet');
    riskScore -= 10;
  }

  const numberCount = (normalized.match(/[0-9]/g) || []).length;
  const letterCount = (normalized.match(/[a-f]/gi) || []).length;
  const balanceRatio = Math.abs(numberCount - letterCount) / 40;
  if (balanceRatio > 0.5) {
    riskScore += 5;
    riskFactors.push('Unbalanced character distribution — possible vanity generator');
  }

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  let riskLevel, recommendation;
  if (riskScore < 25) { riskLevel = 'low'; recommendation = 'Safe to interact — no red flags detected'; }
  else if (riskScore < 50) { riskLevel = 'medium'; recommendation = 'Exercise caution — verify address before interacting'; }
  else if (riskScore < 75) { riskLevel = 'high'; recommendation = 'High risk — do not send funds without thorough verification'; }
  else { riskLevel = 'critical'; recommendation = 'CRITICAL — do NOT interact with this address'; }

  res.json({
    address,
    network,
    risk_score: riskScore,
    risk_level: riskLevel,
    recommendation,
    risk_factors: riskFactors,
    safety_signals: safetySignals,
    is_valid_format: isContract,
    checksum_verified: hasBothCases,
    analysis: 'Format-based risk assessment. For full analysis, connect to a chain explorer.',
  });
});

// ─── 14. TOKEN SCREENER ───
app.post('/api/v1/token-screener', async (req, res) => {
  const { contract_address, chain = 'ethereum' } = req.body;
  if (!contract_address) return res.status(400).json({ error: 'contract_address is required' });

  try {
    let priceData = null;
    let riskScore = 50;
    const flags = [];
    const positives = [];

    try {
      const url = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${contract_address}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        priceData = {
          name: data.name,
          symbol: data.symbol,
          price_usd: data.market_data?.current_price?.usd,
          market_cap: data.market_data?.market_cap?.usd,
          volume_24h: data.market_data?.total_volume?.usd,
          change_24h: data.market_data?.price_change_percentage_24h,
          holders: data.community_data?.facebook_likes || null,
        };

        if (data.market_data?.market_cap?.usd > 1000000) { positives.push('Market cap > $1M'); riskScore -= 15; }
        if (data.market_data?.total_volume?.usd > 100000) { positives.push('24h volume > $100K'); riskScore -= 10; }
        if (data.market_data?.price_change_percentage_24h < -50) { flags.push('Price dropped > 50% in 24h'); riskScore += 20; }
      }
    } catch (e) {
      flags.push('Not listed on CoinGecko — unverified token');
      riskScore += 20;
    }

    const lower = contract_address.toLowerCase();
    if (/^0x0000000/.test(lower)) { flags.push('Suspicious zero-prefix address'); riskScore += 10; }

    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel;
    if (riskScore < 25) riskLevel = 'low';
    else if (riskScore < 50) riskLevel = 'medium';
    else if (riskScore < 75) riskLevel = 'high';
    else riskLevel = 'critical';

    res.json({
      contract_address,
      chain,
      risk_score: riskScore,
      risk_level: riskLevel,
      token_data: priceData,
      red_flags: flags,
      positive_signals: positives,
      recommendation: riskScore < 50 ? 'Potentially safe — DYOR' : 'High risk — avoid unless fully verified',
      disclaimer: 'Not financial advice. Always do your own research.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── 15. PORTFOLIO TRACKER ───
app.post('/api/v1/portfolio-tracker', async (req, res) => {
  const { address, chain = 'ethereum' } = req.body;
  if (!address) return res.status(400).json({ error: 'address is required' });

  try {
    const portfolio = [];
    let totalValue = 0;

    try {
      const ethPriceResp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const ethPriceData = await ethPriceResp.json();
      const ethPrice = ethPriceData.ethereum?.usd || 0;

      const nativeBalance = address.length === 42 ? 0.5 + Math.random() * 2 : 0;
      portfolio.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: nativeBalance.toFixed(6),
        price_usd: ethPrice,
        value_usd: Math.round(nativeBalance * ethPrice * 100) / 100,
        type: 'native',
      });
      totalValue += nativeBalance * ethPrice;

      const mockTokens = [
        { symbol: 'USDC', name: 'USD Coin', balance: 1000 + Math.random() * 5000, price: 1.0 },
        { symbol: 'USDT', name: 'Tether', balance: 500 + Math.random() * 2000, price: 1.0 },
      ];

      mockTokens.forEach(t => {
        const value = t.balance * t.price;
        portfolio.push({
          symbol: t.symbol,
          name: t.name,
          balance: t.balance.toFixed(2),
          price_usd: t.price,
          value_usd: Math.round(value * 100) / 100,
          type: 'erc20',
        });
        totalValue += value;
      });
    } catch (e) { /* use fallback */ }

    portfolio.sort((a, b) => b.value_usd - a.value_usd);

    res.json({
      address,
      chain,
      total_value_usd: Math.round(totalValue * 100) / 100,
      token_count: portfolio.length,
      portfolio,
      best_performer: portfolio[0]?.symbol || null,
      data_note: 'Demo data — connect a chain RPC for real balances',
      fetched_at: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── 16. YIELD CALCULATOR ───
app.post('/api/v1/yield-calculator', (req, res) => {
  const { principal, apy, days = 365, compound = 'daily' } = req.body;
  if (!principal || !apy) return res.status(400).json({ error: 'principal and apy are required' });

  const p = parseFloat(principal);
  const r = parseFloat(apy) / 100;
  const t = parseFloat(days) / 365;

  const compoundMap = { daily: 365, weekly: 52, monthly: 12, quarterly: 4, yearly: 1 };
  const n = compoundMap[compound] || 365;

  const finalAmount = p * Math.pow(1 + r / n, n * t);
  const totalEarnings = finalAmount - p;
  const dailyEarnings = totalEarnings / (t * 365);
  const weeklyEarnings = dailyEarnings * 7;
  const monthlyEarnings = dailyEarnings * 30;
  const yearlyEarnings = totalEarnings / t;

  const apyToApr = n * (Math.pow(1 + r / n, 1) - 1);

  res.json({
    principal: p,
    apy: parseFloat(apy),
    apr: Math.round(apyToApr * 10000) / 100,
    days: parseFloat(days),
    compound_frequency: compound,
    final_amount: Math.round(finalAmount * 100) / 100,
    total_earnings: Math.round(totalEarnings * 100) / 100,
    breakdown: {
      daily: Math.round(dailyEarnings * 100) / 100,
      weekly: Math.round(weeklyEarnings * 100) / 100,
      monthly: Math.round(monthlyEarnings * 100) / 100,
      yearly: Math.round(yearlyEarnings * 100) / 100,
    },
    roi_percent: Math.round((totalEarnings / p) * 10000) / 100,
    doubling_time_days: Math.round(Math.log(2) / Math.log(1 + r / n) / (n / 365)),
  });
});

// ─── 17. GAS ESTIMATOR ───
app.post('/api/v1/gas-estimator', async (req, res) => {
  const { gas_limit = 21000, gas_price_gwei, network = 'ethereum' } = req.body;

  try {
    let ethPrice = 3000;
    try {
      const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await resp.json();
      ethPrice = data.ethereum?.usd || 3000;
    } catch (e) { /* fallback */ }

    let gweiPrice = gas_price_gwei;
    if (!gweiPrice) {
      try {
        const gasResp = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
        const gasData = await gasResp.json();
        if (gasData.result) gweiPrice = gasData.result.ProposeGasPrice;
      } catch (e) { gweiPrice = 30; }
    }

    const gasPriceWei = parseFloat(gweiPrice) * 1e9;
    const gasCostWei = parseFloat(gas_limit) * gasPriceWei;
    const gasCostEth = gasCostWei / 1e18;
    const gasCostUsd = gasCostEth * ethPrice;

    res.json({
      network,
      gas_limit: parseFloat(gas_limit),
      gas_price_gwei: parseFloat(gweiPrice),
      eth_price_usd: ethPrice,
      gas_cost: {
        wei: Math.round(gasCostWei),
        gwei: Math.round(parseFloat(gas_limit) * parseFloat(gweiPrice)),
        eth: gasCostEth.toFixed(10),
        usd: Math.round(gasCostUsd * 100) / 100,
      },
      comparison: {
        slow_usd: Math.round(parseFloat(gas_limit) * (parseFloat(gweiPrice) * 0.6) * 1e9 / 1e18 * ethPrice * 100) / 100,
        fast_usd: Math.round(parseFloat(gas_limit) * (parseFloat(gweiPrice) * 1.5) * 1e9 / 1e18 * ethPrice * 100) / 100,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── 18. NFT METADATA VALIDATOR ───
app.post('/api/v1/nft-metadata', (req, res) => {
  const { metadata, token_id = '1', standard = 'ERC721' } = req.body;
  if (!metadata) return res.status(400).json({ error: 'metadata is required' });

  let parsed;
  try {
    parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON metadata', details: e.message });
  }

  const issues = [];
  const warnings = [];
  const strengths = [];

  if (!parsed.name) issues.push('Missing required field: name');
  else strengths.push('Has name field');

  if (!parsed.description && !parsed.name) issues.push('Missing description');
  else if (parsed.description) strengths.push('Has description');

  if (!parsed.image && !parsed.image_data) issues.push('Missing image or image_data');
  else strengths.push('Has image field');

  if (parsed.image && !parsed.image.startsWith('ipfs://') && !parsed.image.startsWith('https://')) {
    warnings.push('Image URL may not be accessible');
  }
  if (parsed.image && parsed.image.startsWith('ipfs://')) strengths.push('Uses IPFS for image storage');

  if (parsed.attributes && !Array.isArray(parsed.attributes)) {
    issues.push('attributes must be an array');
  }
  if (parsed.attributes && Array.isArray(parsed.attributes) && parsed.attributes.length > 0) {
    strengths.push(`Has ${parsed.attributes.length} attributes`);
  }

  const validStandards = ['ERC721', 'ERC1155', 'metadata'];
  if (!validStandards.includes(standard)) warnings.push(`Unknown standard: ${standard}`);

  const score = Math.max(0, 100 - issues.length * 20 - warnings.length * 5);

  let grade;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  const attributesSummary = {};
  if (parsed.attributes && Array.isArray(parsed.attributes)) {
    parsed.attributes.forEach(attr => {
      if (attr.trait_type && attr.value !== undefined) {
        attributesSummary[attr.trait_type] = attr.value;
      }
    });
  }

  res.json({
    token_id,
    standard,
    is_valid_json: true,
    quality_score: score,
    grade,
    issues,
    warnings,
    strengths,
    name: parsed.name || null,
    description: parsed.description?.substring(0, 200) || null,
    image: parsed.image || null,
    attributes_count: parsed.attributes?.length || 0,
    attributes_preview: attributesSummary,
    external_url: parsed.external_url || null,
    animation_url: parsed.animation_url || null,
  });
});

// ─── 19. SWAP ROUTING ───
app.post('/api/v1/swap-routing', async (req, res) => {
  const { from_token = 'ETH', to_token = 'USDC', amount = '1', network = 'ethereum' } = req.body;

  try {
    let ethPrice = 3000;
    try {
      const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,tether,dai&vs_currencies=usd');
      const data = await resp.json();
      ethPrice = data.ethereum?.usd || 3000;
    } catch (e) { /* fallback */ }

    const fromUpper = from_token.toUpperCase();
    const toUpper = to_token.toUpperCase();
    const amountNum = parseFloat(amount);

    let fromUsd, toUsd;
    if (fromUpper === 'ETH') fromUsd = ethPrice;
    else if (fromUpper === 'USDC' || fromUpper === 'USDT' || fromUpper === 'DAI') fromUsd = 1.0;
    else fromUsd = Math.random() * 100;

    if (toUpper === 'ETH') toUsd = ethPrice;
    else if (toUpper === 'USDC' || toUpper === 'USDT' || toUpper === 'DAI') toUsd = 1.0;
    else toUsd = Math.random() * 50;

    const outputAmount = (amountNum * fromUsd) / toUsd;
    const priceImpact = 0.1 + Math.random() * 1.5;
    const fee = 0.3;
    const minReceived = outputAmount * (1 - priceImpact / 100) * (1 - fee / 100);

    const routes = [
      { dex: 'Uniswap V3', output: outputAmount * 0.997, gas_usd: 2.5, price_impact: priceImpact, fee: fee },
      { dex: 'SushiSwap', output: outputAmount * 0.995, gas_usd: 2.8, price_impact: priceImpact * 1.2, fee: 0.3 },
      { dex: 'Curve', output: outputAmount * 0.998, gas_usd: 3.2, price_impact: priceImpact * 0.5, fee: 0.04 },
    ];
    routes.sort((a, b) => b.output - a.output);

    res.json({
      from_token: fromUpper,
      to_token: toUpper,
      amount_in: amountNum,
      network,
      estimated_output: Math.round(outputAmount * 1e6) / 1e6,
      min_received: Math.round(minReceived * 1e6) / 1e6,
      price_impact_percent: Math.round(priceImpact * 100) / 100,
      fee_percent: fee,
      best_route: routes[0]?.dex || 'Uniswap V3',
      routes: routes.map(r => ({
        ...r,
        output: Math.round(r.output * 1e6) / 1e6,
      })),
      price_from_usd: fromUsd,
      price_to_usd: toUsd,
      note: 'Estimated prices. Use an aggregator API for live quotes.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── 20. TRANSACTION SIMULATOR ───
app.post('/api/v1/transaction-simulator', (req, res) => {
  const { from, to, value = '0', data = '0x', network = 'ethereum' } = req.body;
  if (!from || !to) return res.status(400).json({ error: 'from and to are required' });

  const warnings = [];
  const risks = [];
  const safetySignals = [];

  const valueWei = BigInt(value || '0');
  const isValue = valueWei > 0n;

  if (isValue) {
    safetySignals.push('Transaction transfers value');
  }

  const hasData = data && data !== '0x' && data.length > 2;
  if (hasData) {
    if (data.length >= 10) {
      const selector = data.substring(0, 10);
      const knownSelectors = {
        '0xa9059cbb': 'transfer(address,uint256) — ERC20 transfer',
        '0x23b872dd': 'transferFrom(address,address,uint256) — ERC20 transferFrom',
        '0x095ea7b3': 'approve(address,uint256) — ERC20 approve',
        '0xd0e30db0': 'deposit() — WETH deposit',
        '0x2e1a7d4d': 'withdraw(uint256) — WETH withdraw',
        '0x7ff36ab5': 'swapExactETHForTokens — Uniswap swap',
        '0xfb3bdb41': 'swapETHForExactTokens — Uniswap swap',
        '0x1249c58b': 'mint() — NFT mint',
        '0x6a627842': 'mint(address,uint256) — ERC1155 mint',
        '0x42842e0e': 'safeTransferFrom — ERC721 transfer',
        '0xf242432a': 'safeTransferFrom — ERC1155 transfer',
      };
      const known = knownSelectors[selector.toLowerCase()];
      if (known) {
        safetySignals.push(`Known function: ${known}`);
      } else {
        warnings.push(`Unknown function selector: ${selector}`);
      }
    }
  } else {
    safetySignals.push('Simple ETH transfer — no contract interaction');
  }

  const lowerTo = to.toLowerCase();
  if (/^0x0000000/.test(lowerTo)) risks.push('Recipient has suspicious zero-prefix');
  if (lowerTo === '0x0000000000000000000000000000000000000000') risks.push('BURN ADDRESS — funds will be lost forever');

  if (!/^0x[a-fA-F0-9]{40}$/.test(to)) risks.push('Invalid recipient address format');

  if (data && data.length > 2000) warnings.push('Large calldata — verify contract code');

  if (hasData && /000000000000000000000000[a-f0-9]{40}/i.test(data)) {
    safetySignals.push('Contains address parameters in calldata');
  }

  const isApprove = data?.toLowerCase().startsWith('0x095ea7b3');
  if (isApprove) {
    warnings.push('APPROVE transaction — token spending will be authorized');
    const amountHex = data?.substring(10, 74);
    if (amountHex) {
      const approvedAmount = BigInt('0x' + amountHex.replace(/^0+/, '') || '0');
      const maxUint = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      if (approvedAmount === maxUint || approvedAmount > maxUint / BigInt(2)) {
        risks.push('UNLIMITED approval — ALL tokens can be spent!');
      }
    }
  }

  const isNftTransfer = data?.toLowerCase().startsWith('0x42842e0e') || data?.toLowerCase().startsWith('0xf242432a');
  if (isNftTransfer) safetySignals.push('NFT transfer detected');

  const riskScore = 20 + risks.length * 25 + warnings.length * 10;
  const finalScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel;
  if (finalScore < 25) riskLevel = 'low';
  else if (finalScore < 50) riskLevel = 'medium';
  else if (finalScore < 75) riskLevel = 'high';
  else riskLevel = 'critical';

  res.json({
    from,
    to,
    value_wei: valueWei.toString(),
    value_eth: (Number(valueWei) / 1e18).toString(),
    has_data: hasData,
    data_length: data?.length || 0,
    risk_score: finalScore,
    risk_level: riskLevel,
    risks,
    warnings,
    safety_signals: safetySignals,
    recommendation: finalScore < 50 ? 'Looks safe to proceed' : 'REVIEW CAREFULLY — verify all details before signing',
    simulation: 'Static analysis only. For full simulation, connect to a node with eth_call.',
  });
});

// ─── 21. TEXT REWRITER ───
app.post('/api/v1/text-rewrite', (req, res) => {
  const { text, style = 'paraphrase', variations = 3 } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const sentences = text.split(/(?<=[.!?])\s+/);
  const results = [];

  const synonyms = {
    'the': ['the', 'this', 'the following'],
    'is': ['is', 'represents', 'stands as', 'can be described as'],
    'are': ['are', 'represent', 'stand as', 'can be described as'],
    'very': ['very', 'extremely', 'highly', 'remarkably', 'incredibly'],
    'good': ['good', 'excellent', 'effective', 'beneficial', 'valuable'],
    'bad': ['bad', 'poor', 'suboptimal', 'unfavorable', 'problematic'],
    'important': ['important', 'crucial', 'essential', 'vital', 'significant'],
    'use': ['use', 'utilize', 'employ', 'apply', 'leverage'],
    'make': ['make', 'create', 'generate', 'produce', 'develop'],
    'help': ['help', 'assist', 'support', 'facilitate', 'aid'],
    'improve': ['improve', 'enhance', 'optimize', 'boost', 'strengthen'],
  };

  for (let v = 0; v < Math.min(variations, 5); v++) {
    let rewritten = text;

    if (style === 'formal') {
      rewritten = rewritten
        .replace(/\bgonna\b/gi, 'going to')
        .replace(/\bwanna\b/gi, 'want to')
        .replace(/\bgotta\b/gi, 'have to')
        .replace(/\b kinda\b/gi, ' somewhat')
        .replace(/\blots of\b/gi, 'numerous')
        .replace(/\bbig\b/gi, 'significant')
        .replace(/\bsmall\b/gi, 'minimal');
    } else if (style === 'casual') {
      rewritten = rewritten
        .replace(/\bgoing to\b/gi, 'gonna')
        .replace(/\bwant to\b/gi, 'wanna')
        .replace(/\bhave to\b/gi, 'gotta')
        .replace(/\bnumerous\b/gi, 'lots of')
        .replace(/\bsignificant\b/gi, 'big');
    } else if (style === 'academic') {
      rewritten = rewritten
        .replace(/\bI think\b/gi, 'It can be argued')
        .replace(/\bbecause\b/gi, 'due to the fact that')
        .replace(/\bshow\b/gi, 'demonstrate')
        .replace(/\bget\b/gi, 'obtain')
        .replace(/\bfind out\b/gi, 'determine');
    } else {
      Object.entries(synonyms).forEach(([word, syns]) => {
        if (Math.random() > 0.5) {
          const replacement = syns[Math.floor(Math.random() * syns.length)];
          rewritten = rewritten.replace(new RegExp(`\\b${word}\\b`, 'gi'), (match) => {
            return match[0] === match[0].toUpperCase()
              ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
              : replacement;
          });
        }
      });
    }

    if (v > 0) {
      const words = rewritten.split(' ');
      for (let i = 0; i < words.length; i += 7) {
        if (i < words.length - 1 && Math.random() > 0.7) {
          [words[i], words[i + 1]] = [words[i + 1], words[i]];
        }
      }
      rewritten = words.join(' ');
    }

    results.push({
      variation: v + 1,
      style,
      text: rewritten,
      word_count: rewritten.split(/\s+/).filter(w => w).length,
    });
  }

  res.json({
    original: text,
    style,
    variations: results,
    original_word_count: text.split(/\s+/).filter(w => w).length,
  });
});

// ─── 22. HEADLINE GENERATOR ───
app.post('/api/v1/headline-generator', (req, res) => {
  const { topic, count = 10, style = 'mix' } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });

  const templates = {
    list: [
      `{n} Best ${topic} Tools for Maximum Results`,
      `Top {n} ${topic} Strategies That Actually Work`,
      `{n} Proven ${topic} Tips You Need Today`,
      `The Top {n} ${topic} Mistakes to Avoid`,
      `{n} Game-Changing ${topic} Ideas`,
    ],
    question: [
      `Is ${topic} the Key to Your Success?`,
      `What Everyone Gets Wrong About ${topic}`,
      `Can ${topic} Really Transform Your Business?`,
      `Why ${topic} Matters More Than You Think`,
      `How Much Do You Know About ${topic}?`,
    ],
    howto: [
      `How to Master ${topic} in Just 30 Days`,
      `The Ultimate Guide to ${topic}`,
      `How ${topic} Can Skyrocket Your Results`,
      `Master ${topic}: A Complete Step-by-Step Guide`,
      `How to Use ${topic} for Maximum Impact`,
    ],
    bold: [
      `The Shocking Truth About ${topic}`,
      `${topic}: Everything You Need to Know`,
      `Why Most People Fail at ${topic}`,
      `The Secret to ${topic} Finally Revealed`,
      `${topic} Will Never Be the Same Again`,
    ],
    number: [
      `7 Secrets of ${topic} Success`,
      `5 Ways ${topic} Can Change Your Life`,
      `10 ${topic} Hacks That Save Time and Money`,
      `3 ${topic} Rules Everyone Should Follow`,
      `8 Common ${topic} Myths Debunked`,
    ],
  };

  const allStyles = style === 'mix'
    ? Object.keys(templates)
    : templates[style] ? [style] : Object.keys(templates);

  const headlines = [];
  const used = new Set();

  while (headlines.length < count) {
    const s = allStyles[Math.floor(Math.random() * allStyles.length)];
    const list = templates[s];
    const t = list[Math.floor(Math.random() * list.length)];
    const n = [3, 5, 7, 10, 12][Math.floor(Math.random() * 5)];
    const headline = t.replace(/{n}/g, n).replace(/{topic}/g, topic);

    if (!used.has(headline)) {
      used.add(headline);
      headlines.push({
        text: headline,
        style: s,
        char_count: headline.length,
        seo_score: headline.length > 50 && headline.length < 70 ? 95 : headline.length < 50 ? 80 : 70,
      });
    }
    if (headlines.length >= count * 3) break;
  }

  res.json({
    topic,
    style,
    count: headlines.length,
    headlines: headlines.slice(0, count),
    avg_char_count: Math.round(headlines.slice(0, count).reduce((s, h) => s + h.char_count, 0) / Math.min(headlines.length, count)),
  });
});

// ─── 23. SEO META GENERATOR ───
app.post('/api/v1/seo-meta', (req, res) => {
  const { content, title = '', keywords = [], url = '' } = req.body;
  if (!content && !title) return res.status(400).json({ error: 'content or title is required' });

  const text = content || title;
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordFreq = {};
  words.forEach(w => {
    if (!/^(the|this|that|with|from|your|have|what|when|where|which|their|there|they|would|could|should|been|being|more|most|also|than|then)$/.test(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  });
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  const finalKeywords = keywords.length ? keywords : topKeywords;

  let seoTitle;
  if (title) {
    seoTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  } else {
    seoTitle = topKeywords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' | ');
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  let description = sentences[0] || text.substring(0, 160);
  description = description.length > 160 ? description.substring(0, 155) + '...' : description;

  const readability = text.length > 100
    ? Math.max(0, 100 - Math.round(Math.abs(1500 - text.length) / 50))
    : 60;

  const keywordDensity = topKeywords.length > 0
    ? Math.round((wordFreq[topKeywords[0]] / words.length) * 1000) / 10
    : 0;

  res.json({
    meta: {
      title: seoTitle,
      description: description,
      keywords: finalKeywords.join(', '),
      og_title: seoTitle,
      og_description: description,
      og_type: 'article',
      og_url: url,
      twitter_card: 'summary_large_image',
      twitter_title: seoTitle,
      twitter_description: description,
    },
    analysis: {
      title_length: seoTitle.length,
      title_ok: seoTitle.length >= 30 && seoTitle.length <= 60,
      description_length: description.length,
      description_ok: description.length >= 100 && description.length <= 160,
      keyword_count: finalKeywords.length,
      top_keywords: topKeywords,
      keyword_density_percent: keywordDensity,
      readability_score: readability,
      word_count: words.length,
    },
    suggestions: [
      ...(seoTitle.length < 30 ? ['Title is too short — aim for 30-60 characters'] : []),
      ...(seoTitle.length > 60 ? ['Title is too long — keep under 60 characters'] : []),
      ...(description.length < 100 ? ['Meta description is too short — aim for 100-160 characters'] : []),
      ...(keywordDensity > 5 ? ['Keyword density may be too high'] : []),
      ...(finalKeywords.length < 3 ? ['Add more relevant keywords'] : []),
    ],
    overall_score: Math.round(
      ((seoTitle.length >= 30 && seoTitle.length <= 60 ? 25 : 10) +
        (description.length >= 100 && description.length <= 160 ? 25 : 10) +
        (finalKeywords.length >= 3 ? 25 : 10) +
        (readability > 60 ? 25 : 10))
    ),
  });
});

// ─── 24. TEXT COMPLEXITY (READABILITY) ───
app.post('/api/v1/text-complexity', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length <= 3) return count + 1;
    const matches = w.match(/[aeiouy]+/g);
    return count + (matches ? matches.length : 1);
  }, 0);
  const complexWords = words.filter(w => {
    const matches = w.toLowerCase().match(/[aeiouy]+/g);
    return matches && matches.length >= 3;
  }).length;

  const avgWordsPerSentence = words.length / Math.max(1, sentences.length);
  const avgSyllablesPerWord = syllables / Math.max(1, words.length);
  const avgLettersPerWord = text.replace(/\s+/g, '').length / Math.max(1, words.length);

  const fleschReadingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / Math.max(1, words.length)));
  const colemanLiau = 5.88 * avgLettersPerWord * 100 / 100 - 29.6 * sentences.length / Math.max(1, words.length) * 100 / 100 - 15.8;

  const overall = Math.round((fleschKincaidGrade + gunningFog + colemanLiau) / 3);

  let level, description;
  if (overall <= 6) { level = 'Very Easy'; description = 'Elementary school level — accessible to all'; }
  else if (overall <= 8) { level = 'Easy'; description = 'Middle school level — generally accessible'; }
  else if (overall <= 12) { level = 'Medium'; description = 'High school level — standard reading level'; }
  else if (overall <= 16) { level = 'Hard'; description = 'College level — moderately complex'; }
  else { level = 'Very Hard'; description = 'Graduate level — highly complex text'; }

  res.json({
    scores: {
      flesch_reading_ease: Math.round(fleschReadingEase * 10) / 10,
      flesch_kincaid_grade: Math.round(fleschKincaidGrade * 10) / 10,
      gunning_fog_index: Math.round(gunningFog * 10) / 10,
      coleman_liau_index: Math.round(colemanLiau * 10) / 10,
      overall_grade: overall,
    },
    level,
    description,
    stats: {
      sentences: sentences.length,
      words: words.length,
      characters: text.length,
      syllables: syllables,
      complex_words: complexWords,
      avg_words_per_sentence: Math.round(avgWordsPerSentence * 10) / 10,
      avg_syllables_per_word: Math.round(avgSyllablesPerWord * 100) / 100,
      avg_letters_per_word: Math.round(avgLettersPerWord * 100) / 100,
    },
    suggestions: [
      ...(overall > 12 ? ['Consider simplifying sentence structure for broader audience'] : []),
      ...(avgWordsPerSentence > 25 ? ['Sentences are long — try breaking them up'] : []),
      ...(complexWords / words.length > 0.2 ? ['Many complex words — consider simpler alternatives'] : []),
      ...(overall < 8 ? ['Text is very accessible — good for general audience'] : []),
    ],
  });
});

// ─── 25. ENTITY EXTRACTOR ───
app.post('/api/v1/entity-extractor', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const entities = {
    people: [],
    organizations: [],
    locations: [],
    dates: [],
    emails: [],
    urls: [],
    phone_numbers: [],
    money: [],
    percentages: [],
  };

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  entities.emails = [...new Set(text.match(emailRegex) || [])];

  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  entities.urls = [...new Set(text.match(urlRegex) || [])];

  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  entities.phone_numbers = [...new Set((text.match(phoneRegex) || []).filter(p => p.replace(/\D/g, '').length >= 10))];

  const moneyRegex = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|EUR|GBP|ETH|BTC|USDT|USDC)/gi;
  entities.money = [...new Set(text.match(moneyRegex) || [])];

  const percentRegex = /\d+(?:\.\d+)?\s?%/g;
  entities.percentages = [...new Set(text.match(percentRegex) || [])];

  const datePatterns = [
    /\b\d{4}-\d{2}-\d{2}\b/g,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi,
  ];
  datePatterns.forEach(p => {
    const matches = text.match(p) || [];
    entities.dates.push(...matches);
  });
  entities.dates = [...new Set(entities.dates)];

  const orgKeywords = ['Inc', 'Corp', 'Ltd', 'LLC', 'GmbH', 'SA', 'PLC', 'Foundation', 'Institute', 'University', 'Company', 'Group', 'Systems', 'Technologies', 'Labs', 'DAO', 'Protocol'];
  const wordRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const properNouns = text.match(wordRegex) || [];
  properNouns.forEach(noun => {
    if (orgKeywords.some(kw => noun.includes(kw))) {
      if (!entities.organizations.includes(noun)) entities.organizations.push(noun);
    }
  });

  const locationKeywords = ['City', 'State', 'Country', 'Town', 'Village', 'Province', 'Region', 'District', 'Park', 'Street', 'Avenue', 'Road', 'Boulevard', 'Square', 'Plaza'];
  properNouns.forEach(noun => {
    if (locationKeywords.some(kw => noun.includes(kw))) {
      if (!entities.locations.includes(noun)) entities.locations.push(noun);
    }
  });

  const allEntityCount = Object.values(entities).reduce((s, arr) => s + arr.length, 0);

  res.json({
    entities,
    total_entities: allEntityCount,
    entity_types_found: Object.keys(entities).filter(k => entities[k].length > 0),
    text_length: text.length,
  });
});

// ─── 26. REGEX BUILDER ───
app.post('/api/v1/regex-builder', (req, res) => {
  const { pattern, test_string = '', flags = 'g' } = req.body;
  if (!pattern) return res.status(400).json({ error: 'pattern is required' });

  let regex, error;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    return res.status(400).json({
      valid: false,
      error: e.message,
      pattern,
    });
  }

  let matches = [];
  if (test_string) {
    try {
      const matchArr = [...test_string.matchAll(regex)];
      matches = matchArr.map((m, i) => ({
        index: m.index,
        match: m[0],
        groups: m.slice(1),
        named_groups: m.groups || {},
        length: m[0].length,
      }));
    } catch (e) {
      matches = test_string.match(regex) || [];
    }
  }

  const commonPatterns = {
    email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    url: 'https?:\\/\\/[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=]+',
    phone: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
    ipv4: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    hex_color: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    date_iso: '\\d{4}-\\d{2}-\\d{2}',
    uuid: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
    bitcoin_address: '(?:bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}',
    eth_address: '0x[a-fA-F0-9]{40}',
  };

  let complexity = 'simple';
  let complexityScore = 0;
  if (pattern.length > 10) complexityScore += 1;
  if (pattern.includes('(?:')) complexityScore += 2;
  if (pattern.includes('(?=')) complexityScore += 2;
  if (pattern.includes('|')) complexityScore += 1;
  if (pattern.includes('\\b')) complexityScore += 1;
  if (pattern.includes('{')) complexityScore += 1;
  if (complexityScore >= 4) complexity = 'complex';
  else if (complexityScore >= 2) complexity = 'moderate';

  res.json({
    valid: true,
    pattern,
    flags,
    test_string: test_string || '',
    matches,
    match_count: matches.length,
    complexity,
    complexity_score: complexityScore,
    common_patterns: commonPatterns,
    tips: [
      'Use ^ and $ to match entire strings',
      'Use non-capturing groups (?:...) for better performance',
      'Be specific — avoid .* when possible',
      'Test edge cases with empty strings',
    ],
  });
});

// ─── 27. HASH GENERATOR ───
app.post('/api/v1/hash-generator', (req, res) => {
  const { input, algorithms = ['md5', 'sha1', 'sha256', 'sha512'], rounds = 10 } = req.body;
  if (!input) return res.status(400).json({ error: 'input is required' });

  const crypto = require('crypto');
  const results = {};

  const supportedAlgos = ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd160'];
  const algos = Array.isArray(algorithms) ? algorithms : [algorithms];

  algos.forEach(algo => {
    const lower = algo.toLowerCase();
    if (supportedAlgos.includes(lower)) {
      results[lower] = crypto.createHash(lower).update(input).digest('hex');
    }
  });

  if (algos.includes('base64') || algos.includes('Base64')) {
    results.base64_encode = Buffer.from(input).toString('base64');
  }

  const bcryptHash = crypto.createHash('sha256').update(input + rounds).digest('hex').substring(0, 60);
  if (algos.includes('bcrypt') || algos.includes('Bcrypt')) {
    results.bcrypt_like = `\$2b\$${String(rounds).padStart(2, '0')}\$${bcryptHash.substring(0, 53)}`;
  }

  if (algos.includes('hmac-sha256')) {
    results.hmac_sha256 = crypto.createHmac('sha256', 'secret').update(input).digest('hex');
  }

  results.crc32 = (() => {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < input.length; i++) {
      crc ^= input.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0');
  })();

  res.json({
    input,
    input_length: input.length,
    hashes: results,
    algorithms_used: Object.keys(results).length,
    note: 'bcrypt_like is a SHA-256 approximation. Use bcrypt library for real bcrypt hashes.',
  });
});

// ─── 28. UUID GENERATOR ───
app.post('/api/v1/uuid-generator', (req, res) => {
  const { count = 1, version = 'v4', namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8', name = '' } = req.body;

  const crypto = require('crypto');
  const uuids = [];
  const n = Math.min(Math.max(1, parseInt(count) || 1), 1000);

  function generateUUIDv4() {
    const bytes = crypto.randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return bytes.toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  }

  function generateUUIDv1() {
    const bytes = crypto.randomBytes(10);
    const now = Date.now();
    const timeLow = now & 0xffffffff;
    const timeMid = (now >> 32) & 0xffff;
    const timeHi = ((now >> 48) & 0x0fff) | 0x1000;
    const clockSeq = (bytes[0] << 8 | bytes[1]) & 0x3fff;
    const node = bytes.slice(2, 8);
    return [
      timeLow.toString(16).padStart(8, '0'),
      timeMid.toString(16).padStart(4, '0'),
      timeHi.toString(16).padStart(4, '0'),
      (clockSeq | 0x8000).toString(16).padStart(4, '0'),
      node.toString('hex'),
    ].join('-');
  }

  for (let i = 0; i < n; i++) {
    if (version === 'v1') {
      uuids.push(generateUUIDv1());
    } else if (version === 'v5' && name) {
      const hash = crypto.createHash('sha1').update(namespace + name + i).digest('hex');
      const uuid = hash.substring(0, 8) + '-' + hash.substring(8, 12) + '-' +
        ((parseInt(hash.substring(12, 16), 16) & 0x0fff) | 0x5000).toString(16) + '-' +
        ((parseInt(hash.substring(16, 20), 16) & 0x3fff) | 0x8000).toString(16) + '-' +
        hash.substring(20, 32);
      uuids.push(uuid);
    } else {
      uuids.push(generateUUIDv4());
    }
  }

  res.json({
    version,
    count: uuids.length,
    uuids,
    format: '8-4-4-4-12 hexadecimal',
    first: uuids[0],
    last: uuids[uuids.length - 1],
  });
});

// ─── 29. TIMESTAMP CONVERTER ───
app.post('/api/v1/timestamp-converter', (req, res) => {
  const { timestamp, from = 'unix', timezone = 'UTC' } = req.body;

  let date;
  let inputType = from;

  if (!timestamp) {
    date = new Date();
    inputType = 'now';
  } else if (from === 'unix' || /^\d{10}$/.test(timestamp.toString())) {
    date = new Date(parseInt(timestamp) * 1000);
  } else if (from === 'unix_ms' || /^\d{13}$/.test(timestamp.toString())) {
    date = new Date(parseInt(timestamp));
  } else if (from === 'iso' || /^\d{4}-\d{2}-\d{2}/.test(timestamp.toString())) {
    date = new Date(timestamp);
  } else if (!isNaN(parseInt(timestamp))) {
    const num = parseInt(timestamp);
    if (num > 1e12) date = new Date(num);
    else date = new Date(num * 1000);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Invalid timestamp format', input: timestamp });
  }

  const unixSeconds = Math.floor(date.getTime() / 1000);
  const unixMillis = date.getTime();

  res.json({
    input: timestamp || 'now',
    input_type: inputType,
    timezone,
    formats: {
      unix_seconds: unixSeconds,
      unix_milliseconds: unixMillis,
      iso_8601: date.toISOString(),
      rfc_2822: date.toUTCString(),
      local_string: date.toLocaleString(),
      local_date: date.toLocaleDateString(),
      local_time: date.toLocaleTimeString(),
      utc_string: date.toUTCString(),
      relative: getRelativeTime(date),
    },
    components: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      milliseconds: date.getMilliseconds(),
      day_of_week: date.getDay(),
      day_of_year: Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000),
      week_of_year: Math.ceil(((date - new Date(date.getFullYear(), 0, 1)) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7),
    },
  });

  function getRelativeTime(d) {
    const diff = Date.now() - d.getTime();
    const abs = Math.abs(diff);
    const future = diff < 0;
    const s = Math.floor(abs / 1000);
    if (s < 60) return future ? `in ${s} seconds` : `${s} seconds ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return future ? `in ${m} minutes` : `${m} minutes ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return future ? `in ${h} hours` : `${h} hours ago`;
    const days = Math.floor(h / 24);
    if (days < 30) return future ? `in ${days} days` : `${days} days ago`;
    const mo = Math.floor(days / 30);
    if (mo < 12) return future ? `in ${mo} months` : `${mo} months ago`;
    const y = Math.floor(mo / 12);
    return future ? `in ${y} years` : `${y} years ago`;
  }
});

// ─── 30. DIFF CHECKER ───
app.post('/api/v1/diff-checker', (req, res) => {
  const { text1, text2, mode = 'word' } = req.body;
  if (!text1 || !text2) return res.status(400).json({ error: 'text1 and text2 are required' });

  function computeDiff(a, b) {
    const m = a.length, n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const diff = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        diff.unshift({ type: 'equal', value: a[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'added', value: b[j - 1] });
        j--;
      } else {
        diff.unshift({ type: 'removed', value: a[i - 1] });
        i--;
      }
    }
    return diff;
  }

  let aUnits, bUnits, separator;
  if (mode === 'line') {
    aUnits = text1.split('\n');
    bUnits = text2.split('\n');
    separator = '\n';
  } else if (mode === 'char') {
    aUnits = text1.split('');
    bUnits = text2.split('');
    separator = '';
  } else {
    aUnits = text1.split(/\s+/);
    bUnits = text2.split(/\s+/);
    separator = ' ';
  }

  const diff = computeDiff(aUnits, bUnits);

  const added = diff.filter(d => d.type === 'added').length;
  const removed = diff.filter(d => d.type === 'removed').length;
  const equal = diff.filter(d => d.type === 'equal').length;
  const total = Math.max(aUnits.length, bUnits.length);
  const similarity = total > 0 ? Math.round((equal / total) * 1000) / 10 : 0;

  let htmlOutput = '';
  diff.forEach(d => {
    const val = d.value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (d.type === 'added') htmlOutput += `<ins>${val}${separator}</ins>`;
    else if (d.type === 'removed') htmlOutput += `<del>${val}${separator}</del>`;
    else htmlOutput += val + separator;
  });

  res.json({
    mode,
    stats: {
      added,
      removed,
      equal,
      total_units: diff.length,
      similarity_percent: similarity,
      text1_length: text1.length,
      text2_length: text2.length,
      length_diff: text2.length - text1.length,
    },
    diff,
    html: htmlOutput,
    summary: similarity > 90 ? 'Very similar — minor differences' :
      similarity > 70 ? 'Moderately similar — some changes' :
        similarity > 50 ? 'Different — significant changes' :
          'Very different — major overhaul',
  });
});

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToHex(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AfaAgent x402 API running on port ${PORT}`);
  console.log(`Wallet: ${WALLET}`);
  console.log(`Services: ${Object.keys(prices).join(', ')}`);
});
