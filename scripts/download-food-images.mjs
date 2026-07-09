import { mkdirSync, writeFileSync, readdirSync, unlinkSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CATALOG } from './food-catalog.mjs';
import { getFoodImageFileName, getSearchTerm } from './food-image-meta.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outputDir = resolve(root, 'public/images/foods');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const USER_AGENT = 'ZdravoslovenFoodImages/2.0 (educational project)';

async function fetchWithRetry(url, retries = 5) {
  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
      });

      if (response.status === 429) {
        const waitMs = 8000 + attempt * 5000;
        console.warn(`Rate limited, waiting ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (err) {
      lastError = err;
      await sleep(2000 + attempt * 2000);
    }
  }

  throw lastError || new Error('Request failed');
}

async function searchWikipediaImage(searchTerm) {
  const words = searchTerm.split(' ').filter(Boolean);
  const titles = [
    words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : null,
    words.slice(0, 2).join(' '),
    searchTerm,
  ].filter(Boolean);

  for (const title of titles) {
    try {
      const response = await fetchWithRetry(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        3,
      );
      const data = await response.json();
      if (data.thumbnail?.source) return data.thumbnail.source;
    } catch {
      // try next title
    }
  }

  return null;
}

async function searchWikimediaImage(searchTerm) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: searchTerm,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: '800',
    format: 'json',
    origin: '*',
  });

  const response = await fetchWithRetry(`https://commons.wikimedia.org/w/api.php?${params}`, 3);
  const data = await response.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    const mime = info.mime || '';
    if (!mime.startsWith('image/')) continue;
    if (mime.includes('svg') || mime.includes('gif')) continue;
    return info.thumburl || info.url;
  }

  return null;
}

async function searchOpenFoodFacts(searchTerm) {
  const query = encodeURIComponent(searchTerm.split(' ').slice(0, 3).join(' '));
  const response = await fetchWithRetry(
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=5`,
    3,
  );
  const data = await response.json();
  const product = data.products?.find((p) => p.image_front_url || p.image_url);
  return product?.image_front_url || product?.image_url || null;
}

async function resolveImageUrl(name, category) {
  const searchTerm = getSearchTerm(name, category);
  const sources = [
    () => searchWikipediaImage(searchTerm),
    () => searchWikimediaImage(searchTerm),
    () => searchOpenFoodFacts(searchTerm),
  ];

  for (const source of sources) {
    try {
      const url = await source();
      if (url) return url;
    } catch {
      // next source
    }
    await sleep(1200);
  }

  return null;
}

async function downloadImage(url) {
  const response = await fetchWithRetry(url, 4);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function isValidImage(filePath) {
  try {
    return statSync(filePath).size > 5000;
  } catch {
    return false;
  }
}

async function main() {
  mkdirSync(outputDir, { recursive: true });

  const force = process.argv.includes('--force');
  if (force) {
    for (const file of readdirSync(outputDir)) {
      if (file.endsWith('.jpg')) unlinkSync(resolve(outputDir, file));
    }
  }

  const manifest = [];
  let successCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  for (const [category, items] of Object.entries(CATALOG)) {
    for (const [name] of items) {
      const fileName = getFoodImageFileName(name);
      const filePath = resolve(outputDir, fileName);

      if (!force && isValidImage(filePath)) {
        skippedCount += 1;
        manifest.push({ name, fileName, category, search: getSearchTerm(name, category), status: 'skipped' });
        console.log(`SKIP ${fileName}`);
        continue;
      }

      try {
        const imageUrl = await resolveImageUrl(name, category);
        if (!imageUrl) throw new Error('No matching image found');

        const image = await downloadImage(imageUrl);
        writeFileSync(filePath, image);
        successCount += 1;
        manifest.push({ name, fileName, category, search: getSearchTerm(name, category), status: 'ok' });
        console.log(`OK ${fileName} <- ${name}`);
      } catch (err) {
        failCount += 1;
        console.error(`FAIL ${fileName} (${name}): ${err.message}`);
      }

      await sleep(2200);
    }
  }

  writeFileSync(
    resolve(root, 'public/images/foods/manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );

  console.log(`Done. Success: ${successCount}, Skipped: ${skippedCount}, Fail: ${failCount}`);
  if (failCount > 0) process.exitCode = 1;
}

main();
