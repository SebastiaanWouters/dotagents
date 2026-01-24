# vite-plugin-pwa Configuration

## Installation

```bash
npm install -D vite-plugin-pwa
```

## Basic Configuration (vite.config.ts)

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

## Advanced Configuration with Prompt Update

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

## Register Service Worker (React Example)

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

## Offline Fallback Page

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

## Icon Generation

### Required Icons

| Size | Purpose |
|------|---------|
| 192x192 | Standard PWA icon |
| 512x512 | Splash screen, high-res displays |
| 512x512 maskable | Android adaptive icons (add 20% safe zone) |
| 180x180 | Apple touch icon |
| 32x32, 16x16 | Favicon |

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
