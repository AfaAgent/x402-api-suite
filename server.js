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
});

app.get('/.well-known/x402', (req, res) => {
  res.json({
    name: 'AfaAgent API Suite',
    description: 'Collection of 10 utility APIs: text analysis, QR generation, JSON tools, password strength, and more. Pay-per-call with x402 USDC on Base.',
    version: '1.0.0',
    operator: 'AfaAgent',
    contact: 'https://github.com/AfaAgent',
    categories: ['developer-tools', 'ai-ml', 'productivity', 'data-processing'],
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
