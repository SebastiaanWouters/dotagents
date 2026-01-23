# Playwright Best Practices

Performance optimization, debugging strategies, CI/CD integration, and production-ready test suites.

## Performance Optimization

### Minimize Navigation

```typescript
// ❌ BAD: Multiple navigations
test('multiple pages', async ({ page }) => {
  await page.goto('/page1');
  // ... assertions
  await page.goto('/page2');
  // ... assertions
  await page.goto('/page3');
  // ... assertions
});

// ✅ GOOD: Use beforeEach or separate tests
test.describe('Multiple Pages', () => {
  test('page 1 features', async ({ page }) => {
    await page.goto('/page1');
    // ... assertions
  });

  test('page 2 features', async ({ page }) => {
    await page.goto('/page2');
    // ... assertions
  });
});
```

### Reuse Browser Context

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Reuse browser context for faster tests
    baseURL: 'http://localhost:3000',

    // Keep storage state between tests
    storageState: 'auth.json', // Persist auth
  },
});
```

### Parallelize Tests

```typescript
// Run tests in parallel by default
test.describe.configure({ mode: 'parallel' });

test.describe('Product Catalog', () => {
  test('filter by category', async ({ page }) => {
    // Runs in parallel with other tests
  });

  test('sort by price', async ({ page }) => {
    // Runs in parallel
  });

  test('search products', async ({ page }) => {
    // Runs in parallel
  });
});
```

### Selective Test Execution

```typescript
// Run only smoke tests in CI
npx playwright test --grep @smoke

// Run everything except slow tests locally
npx playwright test --grep-invert @slow
```

### Optimize Waits

```typescript
// ❌ BAD: Arbitrary timeout
await page.waitForTimeout(3000);

// ✅ GOOD: Wait for specific condition
await page.waitForLoadState('networkidle');
await page.getByRole('button').waitFor({ state: 'visible' });

// ✅ GOOD: Playwright auto-waits for most actions
await page.getByRole('button').click(); // Auto-waits for actionability
await expect(page.getByText('Success')).toBeVisible(); // Auto-waits
```

### Network Optimization

```typescript
test('disable images for faster tests', async ({ page }) => {
  // Block images and fonts
  await page.route('**/*.{png,jpg,jpeg,webp,svg,woff,woff2}', route => route.abort());

  await page.goto('/products');
  // Loads much faster without images
});

test('cache API responses', async ({ page }) => {
  const cache = new Map();

  await page.route('**/api/**', async route => {
    const url = route.request().url();

    if (cache.has(url)) {
      await route.fulfill({ body: cache.get(url) });
    } else {
      const response = await route.fetch();
      const body = await response.text();
      cache.set(url, body);
      await route.fulfill({ body });
    }
  });

  await page.goto('/dashboard');
});
```

## Debugging Strategies

### Debug Mode

```bash
# Run single test in debug mode
npx playwright test login.spec.ts --debug

# Debug from specific line
npx playwright test --debug -g "user can login"
```

### Pause Execution

```typescript
test('debug specific point', async ({ page }) => {
  await page.goto('/dashboard');

  // Pause test here for manual inspection
  await page.pause();

  await page.getByRole('button', { name: 'Settings' }).click();
});
```

### Console Logging

```typescript
test('capture browser console', async ({ page }) => {
  const messages: string[] = [];

  page.on('console', msg => {
    messages.push(`[${msg.type()}] ${msg.text()}`);
  });

  await page.goto('/app');

  // Print all console messages
  console.log('Browser console:', messages);
});
```

### Request/Response Logging

```typescript
test('log network activity', async ({ page }) => {
  page.on('request', request =>
    console.log('>>', request.method(), request.url())
  );

  page.on('response', response =>
    console.log('<<', response.status(), response.url())
  );

  await page.goto('/dashboard');
});
```

### Visual Debugging

```typescript
test('screenshot on specific step', async ({ page }) => {
  await page.goto('/checkout');

  // Screenshot before action
  await page.screenshot({ path: 'before-submit.png' });

  await page.getByRole('button', { name: 'Submit' }).click();

  // Screenshot after action
  await page.screenshot({ path: 'after-submit.png' });
});
```

### Slow Motion

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Slow down actions by 1 second
    launchOptions: {
      slowMo: 1000,
    },
  },
});
```

### Trace Viewer

```bash
# Record trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

Configure automatic traces:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry', // Trace only on retry
    // or 'on' for all tests
    // or 'retain-on-failure'
  },
});
```

### Step-by-Step Debugging

```typescript
test('debug with steps', async ({ page }) => {
  await test.step('Navigate to login', async () => {
    await page.goto('/login');
  });

  await test.step('Fill credentials', async () => {
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password');
  });

  await test.step('Submit form', async () => {
    await page.getByRole('button', { name: 'Login' }).click();
  });

  await test.step('Verify dashboard', async () => {
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test --shard=${{ matrix.shard }}/4
        env:
          CI: true

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 30

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results-${{ matrix.shard }}
          path: test-results/
          retention-days: 30
```

### GitLab CI

```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  stage: test
  parallel: 4
  script:
    - npm ci
    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 1 week
```

### Docker

```dockerfile
# Dockerfile.playwright
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
```

```bash
# Build and run
docker build -t e2e-tests -f Dockerfile.playwright .
docker run --rm e2e-tests
```

### Environment Variables

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },

  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```bash
# Run against staging
BASE_URL=https://staging.example.com npx playwright test

# Run against production
BASE_URL=https://example.com npx playwright test --grep @smoke
```

## Test Flakiness Prevention

### Common Causes & Solutions

#### 1. Race Conditions

```typescript
// ❌ BAD: Race condition
test('updates counter', async ({ page }) => {
  await page.goto('/counter');
  await page.getByRole('button', { name: 'Increment' }).click();
  // Value might not be updated yet
  const value = await page.getByTestId('count').textContent();
  expect(value).toBe('1');
});

// ✅ GOOD: Wait for expected state
test('updates counter', async ({ page }) => {
  await page.goto('/counter');
  await page.getByRole('button', { name: 'Increment' }).click();
  await expect(page.getByTestId('count')).toHaveText('1');
});
```

#### 2. Animation Timing

```typescript
// ✅ Disable animations globally
// playwright.config.ts
export default defineConfig({
  use: {
    // Disable CSS animations
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // Inject CSS to disable animations
    styleTag: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  },
});
```

#### 3. Network Timing

```typescript
// ❌ BAD: Assumes instant network
test('loads users', async ({ page }) => {
  await page.goto('/users');
  const users = await page.getByRole('listitem').count();
  expect(users).toBeGreaterThan(0);
});

// ✅ GOOD: Wait for network completion
test('loads users', async ({ page }) => {
  await page.goto('/users', { waitUntil: 'networkidle' });
  await expect(page.getByRole('listitem')).not.toHaveCount(0);
});

// ✅ BEST: Wait for specific element
test('loads users', async ({ page }) => {
  await page.goto('/users');
  await expect(page.getByRole('listitem').first()).toBeVisible();
  const users = await page.getByRole('listitem').count();
  expect(users).toBeGreaterThan(0);
});
```

#### 4. Date/Time Dependencies

```typescript
// ❌ BAD: Depends on current date
test('shows today date', async ({ page }) => {
  await page.goto('/dashboard');
  const today = new Date().toLocaleDateString();
  await expect(page.getByText(today)).toBeVisible();
});

// ✅ GOOD: Use fixed date
test('shows today date', async ({ page }) => {
  // Set fixed date
  await page.addInitScript(() => {
    Date.now = () => new Date('2024-01-15T10:00:00Z').getTime();
  });

  await page.goto('/dashboard');
  await expect(page.getByText('1/15/2024')).toBeVisible();
});
```

#### 5. Database State

```typescript
// ❌ BAD: Shared database state
test('user can delete account', async ({ page }) => {
  // Assumes specific user exists
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Delete Account' }).click();
});

// ✅ GOOD: Create test user
test('user can delete account', async ({ page, db }) => {
  // Create isolated test user
  const userId = await db.query('INSERT INTO users ... RETURNING id');

  await loginAsUser(page, userId);
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Delete Account' }).click();

  // Verify deletion
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  expect(result.rows).toHaveLength(0);
});
```

### Retry Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  // Global retry strategy
  retries: process.env.CI ? 2 : 0,

  // Longer timeouts in CI
  timeout: process.env.CI ? 60000 : 30000,

  expect: {
    timeout: process.env.CI ? 10000 : 5000,
  },
});
```

### Flake Detection

```bash
# Run test 10 times to detect flakiness
npx playwright test login.spec.ts --repeat-each=10

# Run until first failure
npx playwright test --max-failures=1
```

## Production-Ready Test Suites

### Test Categorization

```typescript
// Mark critical tests
test('user can checkout @smoke @critical', async ({ page }) => {
  // Critical business flow
});

// Mark slow tests
test('bulk data import @slow', async ({ page }) => {
  test.slow(); // Triples timeout
  // Long-running test
});

// Mark flaky tests (temporary)
test('flaky animation test @flaky', async ({ page }) => {
  test.fixme(); // Skip this test
  // TODO: Fix race condition
});
```

### Smart Test Selection

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'smoke',
      testMatch: /.*smoke.*\.spec\.ts/,
      retries: 0,
    },
    {
      name: 'regression',
      testMatch: /.*\.spec\.ts/,
      retries: 2,
    },
  ],
});
```

```bash
# CI: Run smoke tests on every commit
npx playwright test --project=smoke

# CI: Run full suite nightly
npx playwright test --project=regression
```

### Health Checks

```typescript
// tests/health/smoke.spec.ts
test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('API is healthy', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
  });

  test('login works', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Test Data Cleanup

```typescript
// Global setup: cleanup before all tests
// global-setup.ts
import { Pool } from 'pg';

export default async function globalSetup() {
  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  await pool.query('TRUNCATE TABLE users, orders, products CASCADE');
  await pool.end();
}

// Global teardown: cleanup after all tests
// global-teardown.ts
export default async function globalTeardown() {
  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  await pool.query('TRUNCATE TABLE users, orders, products CASCADE');
  await pool.end();
}
```

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
```

## Reporting & Metrics

### HTML Report

```bash
# Generate HTML report
npx playwright test
npx playwright show-report
```

### Custom Reporter

```typescript
// reporters/summary-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class SummaryReporter implements Reporter {
  private passed = 0;
  private failed = 0;
  private skipped = 0;

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed') this.passed++;
    if (result.status === 'failed') this.failed++;
    if (result.status === 'skipped') this.skipped++;
  }

  onEnd() {
    console.log('\n=== Test Summary ===');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`⊘ Skipped: ${this.skipped}`);
    console.log(`Total: ${this.passed + this.failed + this.skipped}`);
  }
}

export default SummaryReporter;
```

### Test Duration Tracking

```typescript
// reporters/duration-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class DurationReporter implements Reporter {
  private durations: { test: string; duration: number }[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.durations.push({
      test: test.title,
      duration: result.duration,
    });
  }

  onEnd() {
    // Sort by duration (slowest first)
    const sorted = this.durations.sort((a, b) => b.duration - a.duration);

    console.log('\n=== Top 10 Slowest Tests ===');
    sorted.slice(0, 10).forEach((item, i) => {
      console.log(`${i + 1}. ${item.test} - ${(item.duration / 1000).toFixed(2)}s`);
    });
  }
}

export default DurationReporter;
```

## Security Testing

### Authentication Tests

```typescript
test.describe('Authentication Security', () => {
  test('prevents brute force login', async ({ page }) => {
    await page.goto('/login');

    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.getByLabel('Email').fill('user@test.com');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Login' }).click();
    }

    // Expect account lockout
    await expect(page.getByText('Account locked')).toBeVisible();
  });

  test('enforces session timeout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login' }).click();

    // Manipulate session expiry
    await page.evaluate(() => {
      const expiry = Date.now() - 1000; // Expired 1 second ago
      localStorage.setItem('sessionExpiry', expiry.toString());
    });

    // Attempt to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

### XSS Prevention

```typescript
test('prevents XSS in user input', async ({ page }) => {
  await page.goto('/profile');

  const maliciousScript = '<script>alert("XSS")</script>';

  await page.getByLabel('Bio').fill(maliciousScript);
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify script is escaped, not executed
  const bio = page.getByTestId('user-bio');
  await expect(bio).toContainText(maliciousScript); // Text content, not HTML

  // Verify no alert dialog appears
  page.on('dialog', () => {
    throw new Error('XSS vulnerability: alert was triggered');
  });
});
```

### CSRF Protection

```typescript
test('requires CSRF token for POST requests', async ({ page, request }) => {
  // Attempt POST without CSRF token
  const response = await request.post('/api/users', {
    data: { name: 'Hacker' },
  });

  expect(response.status()).toBe(403); // Forbidden
});

test('accepts requests with valid CSRF token', async ({ page }) => {
  await page.goto('/profile');

  // Get CSRF token from page
  const csrfToken = await page.locator('meta[name="csrf-token"]').getAttribute('content');

  // Submit form with CSRF token
  await page.getByLabel('Name').fill('John Doe');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Profile updated')).toBeVisible();
});
```

## Advanced Playwright Features

### API Testing

```typescript
test.describe('API Tests', () => {
  test('GET /api/users returns user list', async ({ request }) => {
    const response = await request.get('/api/users');

    expect(response.ok()).toBeTruthy();
    const users = await response.json();
    expect(users).toHaveLength(2);
  });

  test('POST /api/users creates new user', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        email: 'newuser@test.com',
        name: 'New User',
      },
    });

    expect(response.status()).toBe(201);
    const user = await response.json();
    expect(user.email).toBe('newuser@test.com');
  });
});
```

### Multi-Page Tests

```typescript
test('handles multiple tabs', async ({ context }) => {
  const page1 = await context.newPage();
  const page2 = await context.newPage();

  await page1.goto('/account');
  await page2.goto('/settings');

  // Change setting in page2
  await page2.getByLabel('Theme').selectOption('dark');
  await page2.getByRole('button', { name: 'Save' }).click();

  // Verify change reflected in page1
  await page1.reload();
  const theme = await page1.locator('html').getAttribute('data-theme');
  expect(theme).toBe('dark');
});
```

### WebSocket Testing

```typescript
test('receives real-time notifications', async ({ page }) => {
  await page.goto('/dashboard');

  // Listen for WebSocket messages
  const messages: any[] = [];
  page.on('websocket', ws => {
    ws.on('framereceived', event => {
      messages.push(JSON.parse(event.payload));
    });
  });

  // Trigger notification
  await page.evaluate(() => {
    fetch('/api/trigger-notification', { method: 'POST' });
  });

  // Wait for WebSocket message
  await page.waitForTimeout(1000);
  expect(messages).toHaveLength(1);
  expect(messages[0].type).toBe('notification');
});
```

This covers production-grade Playwright testing strategies!
