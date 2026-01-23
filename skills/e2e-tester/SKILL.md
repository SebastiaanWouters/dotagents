---
name: e2e-tester
description: >
  Uses Playwright (via MCP) to explore UI, capture stable locators, and draft CI-ready E2E tests.
  Triggers on "e2e test", "write e2e tests", "test the UI", "/e2e-tester".
  Use for validating user flows (auth, forms, navigation) or reproducing flaky UI bugs.
---

# E2E Tester

Two-phase workflow: **explore interactively** via MCP, then **generate CI-ready** `@playwright/test` code.

**Runtime:** MCP interactive browser control  
**Output:** CI-compatible Playwright Test files (`test/expect`)  
**Constraint:** Never commit `aria-ref` or `accessibilitySnapshot`—MCP-only

## Prerequisites

1. Load playwriter skill: `use playwriter`
2. Chrome extension installed and clicked on target tab (screenshot to verify control)
3. App running at accessible URL

## Two Modes

### 🔍 Exploration (MCP-only)
Use for discovery—DO NOT commit this code:
```js
// Discover page structure
console.log(await accessibilitySnapshot({ page }));
await screenshotWithAccessibilityLabels({ page });

// Quick interaction test
await page.goto('http://localhost:3000');
console.log('URL:', page.url());
```

### ✅ Committed Test (CI-ready)
Generate this for the test file:
```ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
});
```

## Locator Strategy (CI-safe)

Use in order of preference:

```ts
// 1. Test IDs (most stable)
await page.getByTestId('sign-in-btn').click();

// 2. Role + name (semantic, accessible)
await page.getByRole('button', { name: /submit/i }).click();

// 3. Label (for form inputs)
await page.getByLabel('Email').fill('test@example.com');

// 4. CSS only if stable (data attributes, semantic tags)
await page.locator('[data-action="save"]').click();
```

### Locator Anti-patterns
- ❌ `.nth()` unless unavoidable
- ❌ CSS utility classes (`bg-blue-500`, `flex`)
- ❌ Dynamic/generated selectors
- ❌ XPath (usually)
- ❌ Brittle text-only for dynamic content

### When to Add Test IDs
- Add `data-testid` to interactive elements (buttons, inputs, links)
- Use kebab-case: `data-testid="submit-order-btn"`
- Avoid on purely presentational wrappers

## Canonical Test Template

```ts
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows validation error for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert')).toContainText('required');
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('secure123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
```

## Wait Strategies (prefer Playwright-native)

```ts
// ✅ Good: Playwright's built-in waits
await expect(page).toHaveURL(/\/dashboard/);
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Success');
await page.waitForResponse(res => res.url().includes('/api/users'));
await locator.waitFor({ state: 'visible' });

// ❌ Avoid: arbitrary timeouts (flaky)
await page.waitForTimeout(1000);
```

## API Response Handling

```ts
// Preferred: waitForResponse
test('loads user data', async ({ page }) => {
  const responsePromise = page.waitForResponse(
    res => res.url().includes('/api/users') && res.status() === 200
  );
  
  await page.getByRole('button', { name: /load/i }).click();
  const response = await responsePromise;
  
  expect(response.status()).toBe(200);
});
```

## Auth Best Practice: storageState

Login once, reuse session:

```ts
// global-setup.ts
import { chromium } from '@playwright/test';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
  
  await page.context().storageState({ path: '.auth/user.json' });
  await browser.close();
}
```

```ts
// playwright.config.ts
export default defineConfig({
  globalSetup: './global-setup.ts',
  use: {
    storageState: '.auth/user.json',
  },
});
```

## Rules

- **Two modes:** Exploration (MCP) vs Committed (CI)—never mix
- **Use `expect`:** Not manual `if/throw` checks
- **Native waits:** Avoid `waitForTimeout`
- **CI-safe locators:** `getByTestId`, `getByRole`, `getByLabel`—never `aria-ref`
- **Local variables:** Not global `state` object
- **Never close browser:** `browser.close()` breaks MCP session
- **Screenshot on failures** for debugging

## Reference Files

- `reference/advanced-patterns.md` - Page objects, dynamic content, security tests
- `reference/ci-cd.md` - GitHub Actions, Docker, Playwright config
- `reference/performance.md` - Core Web Vitals, a11y audits, load testing
