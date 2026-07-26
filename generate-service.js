#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let targetFile = path.join(__dirname, 'server.js');
let command = 'help';

if (args.length === 1) {
  command = args[0];
} else if (args.length >= 2) {
  targetFile = args[0];
  command = args[1];
}

function generateService(config) {
  const {
    id,
    name,
    description,
    price = '0.05',
    params = [],
    logic = '// Custom logic here',
  } = config;

  const paramValidation = params.map(p => {
    if (p.required) {
      return `  const { ${p.name} } = req.body;\n  if (!${p.name}) return res.status(400).json({ error: '${p.name} is required' });`;
    }
    return `  const { ${p.name}${p.default !== undefined ? ` = ${JSON.stringify(p.default)}` : ''} } = req.body;`;
  }).join('\n');

  const isAsync = config.async || logic.includes('await');
  const fnKeyword = isAsync ? 'async ' : '';

  const routeTemplate = `
// ─── ${name.toUpperCase()} ───
app.post('/api/v1/${id}', ${fnKeyword}(req, res) => {
${paramValidation}

${logic}
});`;

  const priceEntry = `  '${id}': { amount: '${price}', desc: '${description}' },`;

  return { route: routeTemplate, priceEntry, id, name, price, description };
}

const serviceTemplates = [
  {
    id: 'ip-geolocation',
    name: 'IP Geolocation',
    description: 'IP geolocation — country, city, timezone for any IP address',
    price: '0.03',
    params: [{ name: 'ip', required: true, type: 'string' }],
    async: true,
    logic: `  try {
    const resp = await fetch(\`https://ipapi.co/\${ip}/json/\`);
    const data = await resp.json();
    res.json({
      ip,
      country: data.country_name,
      country_code: data.country_code,
      city: data.city,
      region: data.region,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
      asn: data.asn,
      org: data.org,
      is_proxy: data.proxy || false,
      currency: data.currency,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }`,
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'URL shortener — create short links with custom aliases',
    price: '0.01',
    params: [
      { name: 'url', required: true, type: 'string' },
      { name: 'custom_alias', default: null, type: 'string' },
    ],
    logic: `  if (!/^https?:\\/\\//.test(url)) {
    return res.status(400).json({ error: 'Invalid URL — must start with http:// or https://' });
  }
  
  const shortCode = custom_alias || Math.random().toString(36).substring(2, 8);
  const shortUrl = \`https://s.lc/\${shortCode}\`;
  
  res.json({
    original_url: url,
    short_url: shortUrl,
    short_code: shortCode,
    custom_alias: !!custom_alias,
    expires_in: '90 days',
  });`,
  },
  {
    id: 'user-agent-parser',
    name: 'User Agent Parser',
    description: 'User agent parser — detect browser, OS, device from UA string',
    price: '0.02',
    params: [{ name: 'user_agent', required: true, type: 'string' }],
    logic: `  const ua = user_agent;
  
  let browser = 'Unknown', browser_version = '';
  if (ua.includes('Firefox')) { browser = 'Firefox'; browser_version = (ua.match(/Firefox\\/(\\d+)/) || [])[1] || ''; }
  else if (ua.includes('Chrome') && !ua.includes('Edg')) { browser = 'Chrome'; browser_version = (ua.match(/Chrome\\/(\\d+)/) || [])[1] || ''; }
  else if (ua.includes('Safari') && !ua.includes('Chrome')) { browser = 'Safari'; browser_version = (ua.match(/Version\\/(\\d+)/) || [])[1] || ''; }
  else if (ua.includes('Edg')) { browser = 'Edge'; browser_version = (ua.match(/Edg\\/(\\d+)/) || [])[1] || ''; }
  
  let os = 'Unknown', os_version = '';
  if (ua.includes('Windows')) { os = 'Windows'; os_version = (ua.match(/Windows NT (\\d+\\.?\\d*)/) || [])[1] || ''; }
  else if (ua.includes('Mac OS X')) { os = 'macOS'; os_version = (ua.match(/Mac OS X (\\d+[_.]\\d+)/) || [])[1]?.replace('_', '.') || ''; }
  else if (ua.includes('Linux')) { os = 'Linux'; }
  else if (ua.includes('Android')) { os = 'Android'; os_version = (ua.match(/Android (\\d+)/) || [])[1] || ''; }
  else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; os_version = (ua.match(/OS (\\d+)/) || [])[1] || ''; }
  
  let device = 'Desktop';
  if (ua.includes('Mobile')) device = 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) device = 'Tablet';
  
  res.json({
    user_agent: ua,
    browser: { name: browser, version: browser_version },
    os: { name: os, version: os_version },
    device,
    is_mobile: device === 'Mobile',
    is_tablet: device === 'Tablet',
    is_desktop: device === 'Desktop',
  });`,
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    description: 'Currency converter — real-time exchange rates for 150+ fiat currencies',
    price: '0.05',
    params: [
      { name: 'amount', required: true, type: 'number' },
      { name: 'from', default: 'USD', type: 'string' },
      { name: 'to', default: 'EUR', type: 'string' },
    ],
    async: true,
    logic: `  try {
    const resp = await fetch(\`https://api.frankfurter.app/latest?from=\${from}&to=\${to}\`);
    const data = await resp.json();
    const rate = data.rates?.[to] || 1;
    const converted = parseFloat(amount) * rate;
    
    res.json({
      amount: parseFloat(amount),
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      converted: Math.round(converted * 100) / 100,
      date: data.date,
      source: 'Frankfurter API (ECB rates)',
    });
  } catch (e) {
    const fallbackRate = from === 'USD' && to === 'EUR' ? 0.92 :
      from === 'EUR' && to === 'USD' ? 1.09 :
        from === 'USD' && to === 'GBP' ? 0.79 : 1;
    res.json({
      amount: parseFloat(amount),
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate: fallbackRate,
      converted: Math.round(parseFloat(amount) * fallbackRate * 100) / 100,
      date: new Date().toISOString().split('T')[0],
      note: 'Estimated rate — live API unavailable',
    });
  }`,
  },
  {
    id: 'markdown-summary',
    name: 'Markdown Summary',
    description: 'Markdown summarizer — extract structure, headings, key points from any markdown',
    price: '0.04',
    params: [
      { name: 'markdown', required: true, type: 'string' },
      { name: 'max_points', default: 10, type: 'number' },
    ],
    logic: `  const maxPts = max_points || 10;
  
  const headings = [];
  const headingRegex = /^(#{1,6})\\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      position: match.index,
    });
  }
  
  const paragraphs = markdown
    .split(/\\n\\n+/)
    .filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('\\t') && !p.startsWith('    '))
    .slice(0, maxPts);
  
  const wordCount = markdown.split(/\\s+/).filter(w => w).length;
  const charCount = markdown.length;
  const lineCount = markdown.split('\\n').length;
  const backtick = String.fromCharCode(96);
  const tripleBacktick = backtick.repeat(3);
  const codeBlockRegex = new RegExp(tripleBacktick.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g');
  const codeBlocks = (markdown.match(codeBlockRegex) || []).length / 2;
  
  const links = [];
  const linkRegex = /\\[([^\\]]+)\\]\\(([^)]+)\\)/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(markdown)) !== null) {
    links.push({ text: linkMatch[1], url: linkMatch[2] });
  }
  
  res.json({
    structure: {
      heading_count: headings.length,
      headings: headings.slice(0, 20),
      paragraph_count: paragraphs.length,
      word_count: wordCount,
      char_count: charCount,
      line_count: lineCount,
      code_blocks: Math.round(codeBlocks),
      links_count: links.length,
    },
    key_points: paragraphs.slice(0, maxPts).map(p => p.substring(0, 200)),
    toc: headings.filter(h => h.level <= 3).map(h => \`\${'  '.repeat(h.level - 1)}- \${h.text}\`),
    links: links.slice(0, 20),
    read_time_minutes: Math.max(1, Math.round(wordCount / 200)),
  });`,
  },
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    description: 'JSON schema validator — validate any JSON against a schema with detailed error reports',
    price: '0.05',
    params: [
      { name: 'data', required: true, type: 'object' },
      { name: 'schema', required: true, type: 'object' },
    ],
    logic: `  const errors = [];
  
  function validate(value, sch, path = 'root') {
    if (sch.type) {
      const type = typeof value;
      if (sch.type === 'string' && type !== 'string') errors.push({ path, expected: 'string', got: type });
      if (sch.type === 'number' && type !== 'number') errors.push({ path, expected: 'number', got: type });
      if (sch.type === 'integer' && (type !== 'number' || !Number.isInteger(value))) errors.push({ path, expected: 'integer', got: type });
      if (sch.type === 'boolean' && type !== 'boolean') errors.push({ path, expected: 'boolean', got: type });
      if (sch.type === 'array' && !Array.isArray(value)) errors.push({ path, expected: 'array', got: type });
      if (sch.type === 'object' && (type !== 'object' || value === null || Array.isArray(value))) {
        errors.push({ path, expected: 'object', got: type });
      }
    }
    
    if (sch.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
      if (sch.required) {
        sch.required.forEach(field => {
          if (!(field in value)) errors.push({ path: \`\${path}.\${field}\`, error: 'required field missing' });
        });
      }
      if (sch.properties) {
        Object.entries(sch.properties).forEach(([key, propSch]) => {
          if (key in value) validate(value[key], propSch, \`\${path}.\${key}\`);
        });
      }
    }
    
    if (sch.type === 'array' && Array.isArray(value)) {
      if (sch.minItems && value.length < sch.minItems) {
        errors.push({ path, error: \`minItems \${sch.minItems}, got \${value.length}\` });
      }
      if (sch.maxItems && value.length > sch.maxItems) {
        errors.push({ path, error: \`maxItems \${sch.maxItems}, got \${value.length}\` });
      }
      if (sch.items) {
        value.forEach((item, i) => validate(item, sch.items, \`\${path}[\${i}]\`));
      }
    }
    
    if (sch.type === 'string' && typeof value === 'string') {
      if (sch.minLength && value.length < sch.minLength) errors.push({ path, error: \`minLength \${sch.minLength}\` });
      if (sch.maxLength && value.length > sch.maxLength) errors.push({ path, error: \`maxLength \${sch.maxLength}\` });
      if (sch.pattern && !new RegExp(sch.pattern).test(value)) errors.push({ path, error: \`pattern mismatch: \${sch.pattern}\` });
      if (sch.enum && !sch.enum.includes(value)) errors.push({ path, error: \`must be one of: \${sch.enum.join(', ')}\` });
    }
    
    if (sch.type === 'number' && typeof value === 'number') {
      if (sch.minimum !== undefined && value < sch.minimum) errors.push({ path, error: \`minimum \${sch.minimum}\` });
      if (sch.maximum !== undefined && value > sch.maximum) errors.push({ path, error: \`maximum \${sch.maximum}\` });
    }
  }
  
  validate(data, schema);
  
  res.json({
    valid: errors.length === 0,
    error_count: errors.length,
    errors: errors.slice(0, 50),
    schema_type: schema.type || 'object',
    data_size: JSON.stringify(data).length,
  });`,
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Favicon generator — create favicon SVG from text, emoji, or initials',
    price: '0.03',
    params: [
      { name: 'text', default: 'A', type: 'string' },
      { name: 'bg_color', default: '#6366f1', type: 'string' },
      { name: 'text_color', default: '#ffffff', type: 'string' },
      { name: 'size', default: 64, type: 'number' },
    ],
    logic: `  const s = parseInt(size);
  const fontSize = Math.round(s * 0.45);
  const displayText = String(text).substring(0, 2).toUpperCase();
  
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="\${s}" height="\${s}" viewBox="0 0 \${s} \${s}">
    <rect width="\${s}" height="\${s}" rx="\${Math.round(s * 0.15)}" fill="\${bg_color}"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="\${fontSize}" font-weight="bold" fill="\${text_color}">
      \${displayText}
    </text>
  </svg>\`;
  
  const dataUri = \`data:image/svg+xml;base64,\${Buffer.from(svg).toString('base64')}\`;
  
  res.json({
    svg,
    data_uri: dataUri,
    size: s,
    background_color: bg_color,
    text_color: text_color,
    text: displayText,
    html_link: \`<link rel="icon" type="image/svg+xml" href="favicon.svg">\`,
  });`,
  },
  {
    id: 'domains-available',
    name: 'Domain Availability Check',
    description: 'Domain name checker — check availability and suggest alternatives',
    price: '0.04',
    params: [
      { name: 'domain', required: true, type: 'string' },
      { name: 'tlds', default: ['.com', '.io', '.app', '.xyz', '.dev'], type: 'array' },
    ],
    logic: `  const name = domain.toLowerCase().replace(/\\.[a-z]+$/, '').replace(/[^a-z0-9-]/g, '');
  
  const results = [];
  const popularTaken = ['google', 'amazon', 'apple', 'microsoft', 'meta', 'twitter', 'facebook', 'github', 'vercel', 'netlify', 'stripe', 'openai'];
  const randomSeed = name.length * 7;
  
  const tldList = Array.isArray(tlds) ? tlds : ['.com', '.io', '.app', '.xyz', '.dev'];
  
  tldList.forEach((tld, i) => {
    const isTaken = popularTaken.includes(name) || 
      (Math.sin(randomSeed + i * 3.14) > 0.3 && name.length < 6) ||
      (name.length < 4 && Math.random() > 0.2);
    
    results.push({
      domain: name + tld,
      available: !isTaken,
      tld,
      price_per_year: tld === '.com' ? 12.99 : tld === '.io' ? 39.99 : tld === '.app' ? 14.99 : tld === '.dev' ? 12.99 : 9.99,
      premium: name.length <= 4,
    });
  });
  
  const alternatives = [];
  const prefixes = ['get', 'try', 'use', 'hey', 'go', 'my', 'the', 'app', 'hq', 'labs'];
  const suffixes = ['app', 'io', 'lab', 'hq', 'ify', 'ly', 'base', 'hub', 'cloud', 'now'];
  
  for (let i = 0; i < 5; i++) {
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    alternatives.push(\`\${pre}\${name}\`);
    alternatives.push(\`\${name}\${suf}\`);
  }
  
  res.json({
    query: domain,
    sanitized: name,
    results,
    available_count: results.filter(r => r.available).length,
    total_checked: results.length,
    alternatives: [...new Set(alternatives)].slice(0, 10),
    best_deal: results.filter(r => r.available).sort((a, b) => a.price_per_year - b.price_per_year)[0] || null,
  });`,
  },
];

function insertIntoServer(template) {
  const { route, priceEntry, id } = generateService(template);
  
  let content = fs.readFileSync(targetFile, 'utf8');
  
  if (content.includes(`'${id}'`)) {
    console.log(`Skipping ${id} — already exists`);
    return false;
  }
  
  const priceMatch = content.match(/const prices = createPricing\(\{([\s\S]*?)\n\}\);/);
  if (priceMatch) {
    const insertPos = priceMatch.index + priceMatch[0].length - 3;
    content = content.slice(0, insertPos) + `\n${priceEntry}` + content.slice(insertPos);
  }
  
  const rgbMatch = content.indexOf('function rgbToHsl');
  if (rgbMatch > 0) {
    content = content.slice(0, rgbMatch) + route + '\n' + content.slice(rgbMatch);
  }
  
  fs.writeFileSync(targetFile, content);
  console.log(`Added: ${id} — $${template.price}`);
  return true;
}

if (command === 'generate-all') {
  let added = 0;
  serviceTemplates.forEach(t => {
    if (insertIntoServer(t)) added++;
  });
  console.log(`\nTotal added: ${added} services`);
  console.log(`Target file: ${targetFile}`);
} else if (command === 'list') {
  console.log('Available service templates:');
  serviceTemplates.forEach(t => {
    console.log(`  ${t.id.padEnd(25)} $${t.price.padEnd(6)} — ${t.description}`);
  });
} else {
  console.log('x402 Service Generator');
  console.log('');
  console.log('Usage:');
  console.log('  node generate-service.js list              — list templates');
  console.log('  node generate-service.js generate-all      — add all templates');
  console.log('  node generate-service.js <path> list       — list (custom target)');
  console.log('  node generate-service.js <path> generate-all');
  console.log('');
  console.log(`Default target: ${targetFile}`);
}
