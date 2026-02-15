const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://www.craytivo.com';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && full.endsWith('.html')) out.push(full);
  }
  return out;
}

function fileFromRootHref(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return path.join(ROOT, 'index.html');
  const p = clean.replace(/^\//, '');
  if (path.extname(p)) return path.join(ROOT, p);
  return path.join(ROOT, p, 'index.html');
}

const htmlFiles = walk(ROOT).map((f) => path.relative(ROOT, f));
const errors = [];

for (const relFile of htmlFiles) {
  const full = path.join(ROOT, relFile);
  const html = fs.readFileSync(full, 'utf8');

  const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g)).map((m) => m[1]));

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].trim();
    if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;

    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (id && !ids.has(id)) errors.push(`${relFile}: missing in-page anchor id "${id}"`);
      continue;
    }

    if (href.startsWith('/')) {
      const target = fileFromRootHref(href);
      if (!fs.existsSync(target)) errors.push(`${relFile}: missing root target "${href}" -> ${path.relative(ROOT, target)}`);
      continue;
    }

    const local = href.split('#')[0].split('?')[0];
    if (local === '') continue;
    const target = path.resolve(path.dirname(full), local);
    if (!fs.existsSync(target)) errors.push(`${relFile}: missing relative target "${href}"`);
  }
}

const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const loc = m[1].trim();
    if (!loc.startsWith(SITE)) continue;
    const url = new URL(loc);
    const target = fileFromRootHref(url.pathname);
    if (!fs.existsSync(target)) errors.push(`sitemap.xml: loc missing target "${loc}" -> ${path.relative(ROOT, target)}`);
  }
}

if (errors.length) {
  console.error('Validation failed with issues:');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`Validation passed for ${htmlFiles.length} HTML files.`);
