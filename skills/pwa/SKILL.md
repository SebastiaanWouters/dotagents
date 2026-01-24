---
name: pwa
description: Progressive Web App development guidelines covering manifest configuration, service workers, offline-first strategies, mobile optimization, safe-area handling, and vite-plugin-pwa setup. Triggers on "PWA", "progressive web app", "installable app", "offline app", "service worker", "web manifest".
---

# Progressive Web App (PWA) Skill

Build installable, offline-capable web apps optimized for mobile with desktop compatibility.

## Quick Reference

### Essential HTML Head

```html
<head>
  <!-- Viewport with safe area support -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#000000">

  <!-- PWA capable -->
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="App Name">

  <!-- Manifest & Icons -->
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
</head>
```

### Minimal manifest.webmanifest

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## Display Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `fullscreen` | No browser UI, entire screen | Games, immersive, VR/AR |
| `standalone` | Native app look (recommended) | Most apps |
| `minimal-ui` | Minimal browser UI | Content needing nav |
| `browser` | Standard browser tab | Not recommended |

### Detect Display Mode

```css
@media (display-mode: standalone) {
  .browser-only-nav { display: none; }
}
```

```javascript
const isPWA = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone;
```

---

## Safe Area Handling (Notch/Dynamic Island)

**Required:** `viewport-fit=cover` in viewport meta tag.

### CSS Environment Variables

```css
:root {
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}

/* Apply safe area padding */
body {
  padding: var(--sat) var(--sar) var(--sab) var(--sal);
}

/* Fixed header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: calc(1rem + var(--sat));
  padding-left: calc(1rem + var(--sal));
  padding-right: calc(1rem + var(--sar));
}

/* Fixed bottom navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: calc(0.5rem + var(--sab));
  padding-left: var(--sal);
  padding-right: var(--sar);
}
```

### Landscape Mode

```css
@media (orientation: landscape) {
  .content {
    padding-left: max(1rem, var(--sal));
    padding-right: max(1rem, var(--sar));
  }
}
```

### iOS Status Bar Styles

| Value | Effect |
|-------|--------|
| `default` | White bar, black text |
| `black` | Black bar, white text |
| `black-translucent` | Transparent, content behind |

---

## vite-plugin-pwa Quick Setup

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#000000',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
});
```

**For full configuration:** See [reference/vite-pwa-config.md](reference/vite-pwa-config.md)

---

## Caching Strategies

| Strategy | Best For |
|----------|----------|
| **CacheFirst** | Static assets (images, fonts) |
| **NetworkFirst** | API data, dynamic content |
| **StaleWhileRevalidate** | Mixed content |

**For detailed Workbox config:** See [reference/caching-strategies.md](reference/caching-strategies.md)

---

## Mobile Optimization Essentials

### Touch Targets (min 44x44px)

```css
button, a {
  min-width: 44px;
  min-height: 44px;
}
```

### Prevent Input Zoom (iOS)

```css
input, select, textarea {
  font-size: 16px;
}
```

### Prevent Pull-to-Refresh

```css
html {
  overscroll-behavior-y: contain;
}
```

### Disable Tap Highlight

```css
button, a {
  -webkit-tap-highlight-color: transparent;
}
```

**For complete mobile optimization:** See [reference/mobile-optimization.md](reference/mobile-optimization.md)

---

## PWA Checklist

### Required for Installation

- [ ] HTTPS (localhost allowed for dev)
- [ ] Valid manifest with `name`, `icons`, `start_url`, `display`
- [ ] 192x192 PNG icon
- [ ] 512x512 PNG icon
- [ ] Service worker with fetch handler

### Recommended

- [ ] `viewport-fit=cover` for full screen
- [ ] Safe area insets handling
- [ ] `theme_color` in manifest and meta tag
- [ ] Maskable icon (512x512)
- [ ] Apple touch icon (180x180)
- [ ] `apple-mobile-web-app-status-bar-style` meta tag
- [ ] Offline fallback page

### Performance (Lighthouse 95+)

- [ ] Precache critical assets
- [ ] Runtime caching for API calls
- [ ] Image optimization (WebP/AVIF)
- [ ] Code splitting & lazy loading

---

## Testing

### Lighthouse Audit

1. Chrome DevTools (F12) > Lighthouse tab
2. Select "Progressive Web App"
3. Run audit

### Manual Checks

```javascript
// Check if installed
window.matchMedia('(display-mode: standalone)').matches

// Check service worker
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log('SW:', regs));
```

---

## Reference Files

- [reference/vite-pwa-config.md](reference/vite-pwa-config.md) - Full vite-plugin-pwa configuration
- [reference/caching-strategies.md](reference/caching-strategies.md) - Workbox caching strategies
- [reference/mobile-optimization.md](reference/mobile-optimization.md) - Touch, scroll, responsive design
