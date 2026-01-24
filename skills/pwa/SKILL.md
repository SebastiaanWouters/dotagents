---
name: pwa
description: Progressive Web App development guidelines covering manifest configuration, service workers, offline-first strategies, mobile optimization, safe-area handling, and vite-plugin-pwa setup. Triggers on "PWA", "progressive web app", "installable app", "offline app", "service worker", "web manifest".
---

# Progressive Web App (PWA) Skill

Build installable, offline-capable web apps optimized for mobile with desktop compatibility.

## Quick Reference

### Essential Meta Tags

```html
<head>
  <!-- Viewport with safe area support -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <!-- PWA meta tags -->
  <meta name="theme-color" content="#000000">
  <meta name="mobile-web-app-capable" content="yes">

  <!-- iOS-specific -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="App Name">

  <!-- Manifest -->
  <link rel="manifest" href="/manifest.webmanifest">

  <!-- Icons -->
  <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
</head>
```

### Minimal manifest.webmanifest

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "description": "Description of your app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "any",
  "icons": [
    { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## Display Modes

Choose the right display mode for your app:

| Mode | Description | Use Case |
|------|-------------|----------|
| `fullscreen` | No browser UI, uses entire screen | Games, immersive experiences, VR/AR |
| `standalone` | Native app look, hides browser controls | Most apps (recommended default) |
| `minimal-ui` | Minimal browser UI with navigation | Content sites needing back/forward |
| `browser` | Standard browser tab | Not recommended for PWAs |

### Display Override (Advanced)

Custom fallback chain when primary mode unavailable:

```json
{
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone", "minimal-ui"]
}
```

### Detecting Display Mode in CSS

```css
/* Standalone mode */
@media (display-mode: standalone) {
  .browser-only-nav { display: none; }
}

/* Fullscreen mode */
@media (display-mode: fullscreen) {
  .status-bar { display: none; }
}
```

### Detecting Display Mode in JavaScript

```javascript
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
const isPWA = isStandalone || window.navigator.standalone; // iOS Safari
```

---

## Safe Area Handling (Notch & Rounded Corners)

**Critical for iOS devices with notch/Dynamic Island.**

### Enable Full Screen Coverage

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### CSS Environment Variables

```css
:root {
  /* Fallback values for browsers without notch */
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}

/* Apply safe area padding */
body {
  padding-top: var(--sat);
  padding-right: var(--sar);
  padding-bottom: var(--sab);
  padding-left: var(--sal);
}

/* Fixed header with safe area */
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

/* Full-height container accounting for safe areas */
.app-container {
  min-height: calc(100vh + var(--sat));
  padding: var(--sat) var(--sar) var(--sab) var(--sal);
}
```

### Landscape Mode Safe Areas

```css
/* Handle landscape notch on both sides */
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
| `default` | White status bar with black text |
| `black` | Black status bar with white text |
| `black-translucent` | Transparent, content flows behind |

For immersive apps, use `black-translucent`:

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

---

## vite-plugin-pwa Configuration

### Installation

```bash
npm install -D vite-plugin-pwa
```

### Basic Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'My App',
        short_name: 'App',
        description: 'My Progressive Web App',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
```

### Advanced Configuration with Prompt Update

```typescript
VitePWA({
  registerType: 'prompt',
  devOptions: {
    enabled: true // Enable in development
  },
  workbox: {
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true
  }
})
```

### Register Service Worker (React Example)

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react';

function App() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  return (
    <>
      {needRefresh && (
        <div className="update-prompt">
          <span>New version available!</span>
          <button onClick={() => updateServiceWorker(true)}>
            Update
          </button>
        </div>
      )}
    </>
  );
}
```

---

## Service Worker Caching Strategies

### Strategy Selection Guide

| Strategy | Best For | Freshness | Speed |
|----------|----------|-----------|-------|
| **CacheFirst** | Static assets (images, fonts, CSS) | Low | Fast |
| **NetworkFirst** | API data, dynamic content | High | Variable |
| **StaleWhileRevalidate** | Mixed content, semi-dynamic | Medium | Fast |
| **NetworkOnly** | Real-time data, auth endpoints | Always fresh | Slow |
| **CacheOnly** | Precached assets only | Stale | Fastest |

### Workbox Runtime Caching Examples

```typescript
workbox: {
  runtimeCaching: [
    // Static assets - Cache First
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    // Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    // API calls - Network First with timeout
    {
      urlPattern: /^https:\/\/api\..*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 // 1 hour
        }
      }
    },
    // HTML pages - Stale While Revalidate
    {
      urlPattern: /\.html$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'html-cache'
      }
    }
  ]
}
```

### Offline Fallback Page

```typescript
VitePWA({
  workbox: {
    navigateFallback: '/offline.html',
    navigateFallbackDenylist: [/^\/api/]
  }
})
```

Create `public/offline.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline</title>
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: system-ui;
    }
  </style>
</head>
<body>
  <div>
    <h1>You're offline</h1>
    <p>Check your connection and try again.</p>
  </div>
</body>
</html>
```

---

## Mobile Optimization

### Touch Targets

```css
/* Minimum 44x44px touch targets (Apple HIG) */
button, a, input[type="checkbox"], input[type="radio"] {
  min-width: 44px;
  min-height: 44px;
}

/* Adequate spacing between interactive elements */
.button-group button {
  margin: 8px;
}
```

### Prevent Unwanted Behaviors

```css
/* Disable text selection on UI elements */
.button, .nav-item {
  -webkit-user-select: none;
  user-select: none;
}

/* Disable tap highlight on iOS */
button, a {
  -webkit-tap-highlight-color: transparent;
}

/* Prevent pull-to-refresh in standalone mode */
html {
  overscroll-behavior-y: contain;
}

/* Disable callout on long press */
img, a {
  -webkit-touch-callout: none;
}
```

### Smooth Scrolling

```css
/* Native-feeling scroll */
.scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Hide scrollbars on mobile but keep functionality */
.scrollable::-webkit-scrollbar {
  display: none;
}
.scrollable {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### Input Optimization

```css
/* Prevent zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px; /* Minimum to prevent zoom */
}

/* Remove input styling on iOS */
input, textarea {
  -webkit-appearance: none;
  border-radius: 0;
}
```

### Performance

```html
<!-- Preconnect to critical origins -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- Lazy load images -->
<img src="image.webp" loading="lazy" alt="Description">

<!-- Responsive images -->
<img
  srcset="image-320.webp 320w, image-640.webp 640w, image-1280.webp 1280w"
  sizes="(max-width: 640px) 100vw, 50vw"
  src="image-640.webp"
  alt="Description"
>
```

---

## Desktop Compatibility

### Responsive Layout Strategy

```css
/* Mobile-first base styles */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Tablet breakpoint */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop breakpoint */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }

  /* Show sidebar on desktop */
  .sidebar {
    display: block;
    width: 280px;
  }

  /* Switch from bottom nav to sidebar */
  .bottom-nav {
    display: none;
  }
}

/* Wide desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1200px;
  }
}
```

### Window Controls Overlay (Desktop PWA)

```json
{
  "display_override": ["window-controls-overlay"],
  "display": "standalone"
}
```

```css
/* Title bar area on desktop */
.titlebar {
  position: fixed;
  top: 0;
  left: env(titlebar-area-x, 0);
  width: env(titlebar-area-width, 100%);
  height: env(titlebar-area-height, 40px);
  -webkit-app-region: drag;
}

.titlebar button {
  -webkit-app-region: no-drag;
}
```

---

## PWA Checklist

### Required for Installation

- [ ] HTTPS (localhost allowed for development)
- [ ] Valid web manifest with `name`, `icons`, `start_url`, `display`
- [ ] 192x192 PNG icon
- [ ] 512x512 PNG icon
- [ ] Service worker with fetch handler

### Recommended

- [ ] `theme_color` in manifest and meta tag
- [ ] Maskable icon (512x512 with safe zone)
- [ ] Apple touch icon (180x180)
- [ ] Offline fallback page
- [ ] `viewport-fit=cover` for full screen
- [ ] Safe area insets handling
- [ ] `apple-mobile-web-app-status-bar-style` meta tag

### Performance (Lighthouse 95+)

- [ ] Precache critical assets
- [ ] Runtime caching for API calls
- [ ] Image optimization (WebP/AVIF)
- [ ] Code splitting
- [ ] Lazy loading for images and routes
- [ ] Minimal main bundle size

---

## Icon Generation

### Required Icons

| Size | Purpose |
|------|---------|
| 192x192 | Standard PWA icon |
| 512x512 | Splash screen, high-res displays |
| 512x512 maskable | Android adaptive icons (add 20% safe zone) |
| 180x180 | Apple touch icon |
| 32x32 | Favicon |
| 16x16 | Favicon |

### Generate with @vite-pwa/assets-generator

```bash
npm install -D @vite-pwa/assets-generator
```

```typescript
// pwa-assets.config.ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo.svg']
});
```

```bash
npx pwa-assets-generator
```

---

## Testing PWA

### Lighthouse Audit

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit

### Manual Testing

```javascript
// Check service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations);
  });
}

// Check if app is installed
window.matchMedia('(display-mode: standalone)').matches

// Check cache contents
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => console.log(name, keys.length, 'items'));
    });
  });
});
```

### Clear PWA State

```javascript
// Unregister service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});

// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

---

## Common Issues

### iOS Safari Quirks

| Issue | Solution |
|-------|----------|
| No install prompt | Use "Add to Home Screen" from share menu |
| No push notifications | Not supported on iOS PWA (use web push in Safari) |
| Safe area not applied | Ensure `viewport-fit=cover` and CSS env() vars |
| Audio won't autoplay | Require user interaction first |
| Background sync limited | Use push notifications for updates |

### Service Worker Debugging

```javascript
// Force update
navigator.serviceWorker.ready.then(registration => {
  registration.update();
});

// Skip waiting (in service worker)
self.skipWaiting();
self.clients.claim();
```

### Cache Invalidation

```typescript
// Version your cache names
const CACHE_VERSION = 'v1.2.3';
workbox: {
  cacheId: `my-app-${CACHE_VERSION}`,
  cleanupOutdatedCaches: true
}
```
