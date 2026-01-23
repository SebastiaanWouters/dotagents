#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const paths = [
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
    resolve(__dirname, '../../../.env.local'),
    resolve(__dirname, '../../../.env'),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w]+)\s*=\s*(.*)$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}

loadEnv();

const FAL_KEY = process.env.FAL_API_KEY || process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('Error: FAL_API_KEY not found in .env.local or environment');
  process.exit(1);
}

function parseArgs(args) {
  const opts = {
    prompt: '',
    model: 'fal-ai/nano-banana',
    size: '1:1',
    num: 1,
    format: 'png',
    out: null,
    edit: null,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--model') opts.model = args[++i];
    else if (arg === '--size') opts.size = args[++i];
    else if (arg === '--num') opts.num = parseInt(args[++i], 10);
    else if (arg === '--format') opts.format = args[++i];
    else if (arg === '--out') opts.out = args[++i];
    else if (arg === '--edit') opts.edit = args[++i];
    else if (!arg.startsWith('-')) opts.prompt = arg;
    i++;
  }
  return opts;
}

async function generate(opts) {
  const endpoint = opts.edit
    ? `https://fal.run/${opts.model}/edit`
    : `https://fal.run/${opts.model}`;

  const body = {
    prompt: opts.prompt,
    num_images: opts.num,
    aspect_ratio: opts.size,
    output_format: opts.format,
  };

  if (opts.edit) {
    body.image_urls = [opts.edit];
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fal.ai error ${res.status}: ${err}`);
  }

  return res.json();
}

async function downloadImage(url, path) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(path, buffer);
  console.log(`Saved: ${path}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help')) {
    console.log(`Usage: fal-generate.mjs <prompt> [options]

Options:
  --model <id>     Model (default: fal-ai/nano-banana)
  --size <ratio>   Aspect ratio: 1:1, 16:9, 4:3, etc.
  --num <n>        Number of images 1-4
  --format <fmt>   png, jpeg, webp
  --out <path>     Save first image to file
  --edit <url>     Image URL for editing mode`);
    process.exit(0);
  }

  const opts = parseArgs(args);
  if (!opts.prompt) {
    console.error('Error: prompt required');
    process.exit(1);
  }

  console.log(`Generating with ${opts.model}...`);
  const result = await generate(opts);

  for (const img of result.images) {
    console.log(`Image: ${img.url}`);
    if (img.width && img.height) {
      console.log(`  Size: ${img.width}x${img.height}`);
    }
  }

  if (opts.out && result.images[0]) {
    await downloadImage(result.images[0].url, opts.out);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
