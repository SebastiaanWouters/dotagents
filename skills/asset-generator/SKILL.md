---
name: asset-generator
description: Generate visual assets (favicons, icons, logos, game sprites, UI elements) using fal.ai image generation. Triggers on "generate icon", "create favicon", "make logo", "create sprite", "generate asset".
---

# Asset Generator

Generate production-ready visual assets via fal.ai API.

## Quick Start

```bash
# Generate a favicon
node scripts/fal-generate.mjs "minimalist letter A logo, flat design, single color" --size 1:1 --out favicon.png

# Generate app icon with variations
node scripts/fal-generate.mjs "mobile app icon, weather app, sun and clouds" --num 4 --size 1:1

# Generate game sprite
node scripts/fal-generate.mjs "pixel art sword, 32x32, transparent background" --format png
```

## Script: `scripts/fal-generate.mjs`

Requires `FAL_API_KEY` in `.env.local` (project root) or environment.

```
Usage: node scripts/fal-generate.mjs <prompt> [options]

Options:
  --model <id>     Model (default: fal-ai/nano-banana)
  --size <ratio>   Aspect ratio: 1:1, 16:9, 4:3, etc. (default: 1:1)
  --num <n>        Number of images 1-4 (default: 1)
  --format <fmt>   Output format: png, jpeg, webp (default: png)
  --out <path>     Save to file (downloads image)
  --edit <url>     Image URL for editing mode
```

## Models

| Model | Best For | Cost |
|-------|----------|------|
| `fal-ai/nano-banana` | Fast general assets (default) | Cheap |
| `fal-ai/flux/dev` | High quality, detailed | Medium |
| `fal-ai/recraft/v3` | Vector-style logos, icons | Medium |

## Asset Prompting Tips

### Favicons & App Icons
- Include "flat design", "simple", "minimalist"
- Specify "single object centered"
- Use "no text" unless text is essential

### Logos
- "vector style", "clean lines", "professional"
- "logo design", "brand mark", "symbol"
- Specify color: "monochrome", "blue accent"

### Game Assets
- "pixel art", "sprite", "game asset"
- "transparent background", "isolated"
- Specify dimensions conceptually: "32x32 style"

### UI Icons
- "UI icon", "interface element", "glyph"
- "consistent stroke width", "outlined"
- "icon set style", "material design style"

## Example Workflow

```bash
# 1. Generate logo concepts
node scripts/fal-generate.mjs "modern tech startup logo, abstract geometric, blue gradient" --num 4

# 2. Pick best, generate favicon sizes
node scripts/fal-generate.mjs "minimalist version of [describe chosen logo]" --size 1:1 --out favicon-512.png

# 3. Convert to favicon.ico using ImageMagick (if needed)
convert favicon-512.png -resize 32x32 favicon.ico
```
