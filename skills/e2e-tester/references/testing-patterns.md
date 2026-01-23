# Advanced Testing Patterns

Comprehensive guide to advanced E2E testing patterns, parallel execution, retry strategies, and custom test organization.

## Parallel Execution

### Test Isolation

Run tests in parallel safely by ensuring complete isolation:

```typescript
test.describe.configure({ mode: 'parallel' });

test.describe('Product Catalog', () => {
  test('filter by category', async ({ page }) => {
    // Each test gets fresh browser context
    await page.goto('/products');
    await page.getByRole('button', { name: 'Electronics' }).click();
    await expect(page.getByRole('article')).toHaveCount(12);
  });

  test('sort by price', async ({ page }) => {
    // Runs in parallel with above test
    await page.goto('/products');
    await page.getByRole('button', { name: 'Sort by Price' }).click();
    const first = page.getByRole('article').first();
    await expect(first.getByText('$')).toContainText('$9.99');
  });
});
```

### Worker Sharding

Distribute tests across multiple workers:

```typescript
// playwright.config.ts
export default defineConfig({
  // Use all CPU cores locally, limit in CI
  workers: process.env.CI ? 2 : undefined,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,
});
```

Run with sharding across machines:

```bash
# Machine 1 (runs 1st half)
npx playwright test --shard=1/2

# Machine 2 (runs 2nd half)
npx playwright test --shard=2/2
```

### Serial Execution for Dependent Tests

```typescript
test.describe.serial('Onboarding Flow', () => {
  test('step 1: create account', async ({ page }) => {
    await page.goto('/signup');
    // ... signup flow
  });

  test('step 2: verify email', async ({ page }) => {
    // Continues from previous test state
    await page.goto('/verify');
    // ... verification
  });

  test('step 3: complete profile', async ({ page }) => {
    await page.goto('/profile/setup');
    // ... profile setup
  });
});
```

## Retry Strategies

### Automatic Retries

```typescript
// playwright.config.ts
export default defineConfig({
  // Retry failed tests twice
  retries: 2,

  // Or per-project
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      retries: 3, // Override global setting
    },
  ],
});
```

### Conditional Retries

```typescript
test('flaky network request', async ({ page }) => {
  // Retry this specific test up to 3 times
  test.info().annotations.push({ type: 'retry', description: '3' });

  await page.goto('/dashboard');
  await expect(page.getByText('Data loaded')).toBeVisible({ timeout: 5000 });
});
```

### Custom Retry Logic

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

test('resilient API call', async ({ page }) => {
  await page.goto('/dashboard');

  const data = await retryOperation(async () => {
    const response = await page.request.get('/api/stats');
    if (!response.ok()) throw new Error('API failed');
    return response.json();
  });

  expect(data.users).toBeGreaterThan(0);
});
```

## Test Data Management

### Database Seeding

```typescript
// fixtures/db-helpers.ts
import { Pool } from 'pg';

export async function seedDatabase() {
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });

  await pool.query('TRUNCATE TABLE users, products, orders CASCADE');

  await pool.query(`
    INSERT INTO users (email, password) VALUES
    ('user1@test.com', 'hashed_pass_1'),
    ('user2@test.com', 'hashed_pass_2')
  `);

  await pool.query(`
    INSERT INTO products (name, price, stock) VALUES
    ('Widget', 19.99, 100),
    ('Gadget', 29.99, 50)
  `);

  await pool.end();
}

export async function cleanDatabase() {
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await pool.query('TRUNCATE TABLE users, products, orders CASCADE');
  await pool.end();
}
```

```typescript
// test file
import { test } from '@playwright/test';
import { seedDatabase, cleanDatabase } from './fixtures/db-helpers';

test.beforeEach(async () => {
  await cleanDatabase();
  await seedDatabase();
});

test('user can view products', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('article')).toHaveCount(2);
});
```

### API Mocking with MSW

```typescript
// fixtures/mock-server.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),
];

export const server = setupServer(...handlers);
```

```typescript
// tests/with-mocking.spec.ts
import { test, expect } from '@playwright/test';
import { server } from './fixtures/mock-server';

test.beforeAll(() => server.listen());
test.afterEach(() => server.resetHandlers());
test.afterAll(() => server.close());

test('displays mocked user list', async ({ page }) => {
  await page.goto('/users');
  await expect(page.getByText('Alice')).toBeVisible();
  await expect(page.getByText('Bob')).toBeVisible();
});
```

### Factory Pattern for Test Data

```typescript
// fixtures/factories.ts
type User = {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
};

let userIdCounter = 0;

export function createUser(overrides?: Partial<User>): User {
  userIdCounter++;
  return {
    email: `user${userIdCounter}@test.com`,
    password: 'SecurePass123!',
    name: `Test User ${userIdCounter}`,
    role: 'user',
    ...overrides,
  };
}

export function createAdminUser(overrides?: Partial<User>): User {
  return createUser({ role: 'admin', ...overrides });
}
```

```typescript
// Usage in tests
import { createUser, createAdminUser } from './fixtures/factories';

test('admin can delete users', async ({ page }) => {
  const admin = createAdminUser();
  const regularUser = createUser();

  // ... setup users in database
  // ... login as admin
  // ... delete regular user
});
```

## Custom Fixtures

### Authentication Fixture

```typescript
// fixtures/auth.ts
import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login as regular user
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');

    await use(page);

    // Cleanup: logout
    await page.getByRole('button', { name: 'Logout' }).click();
  },

  adminPage: async ({ page }, use) => {
    // Login as admin
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/admin');

    await use(page);

    await page.getByRole('button', { name: 'Logout' }).click();
  },
});
```

```typescript
// tests/admin.spec.ts
import { test } from './fixtures/auth';
import { expect } from '@playwright/test';

test('admin can access settings', async ({ adminPage }) => {
  await adminPage.goto('/admin/settings');
  await expect(adminPage.getByRole('heading', { name: 'Admin Settings' })).toBeVisible();
});

test('regular user cannot access admin panel', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/admin');
  await expect(authenticatedPage.getByText('Access Denied')).toBeVisible();
});
```

### Database Fixture

```typescript
// fixtures/database.ts
import { test as base } from '@playwright/test';
import { Pool } from 'pg';

type DbFixtures = {
  db: Pool;
};

export const test = base.extend<DbFixtures>({
  db: async ({}, use) => {
    const pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
    });

    // Clean database before each test
    await pool.query('TRUNCATE TABLE users, orders, products CASCADE');

    await use(pool);

    // Cleanup after test
    await pool.end();
  },
});
```

```typescript
// Usage
import { test } from './fixtures/database';

test('creates order in database', async ({ page, db }) => {
  // Seed test data
  await db.query(`
    INSERT INTO products (id, name, price)
    VALUES (1, 'Widget', 19.99)
  `);

  // Perform UI actions
  await page.goto('/products/1');
  await page.getByRole('button', { name: 'Buy Now' }).click();

  // Verify database state
  const result = await db.query('SELECT * FROM orders WHERE product_id = 1');
  expect(result.rows).toHaveLength(1);
});
```

## Custom Reporters

### JSON Reporter for CI

```typescript
// reporters/json-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';

class JsonReporter implements Reporter {
  private results: any[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({
      title: test.title,
      file: test.location.file,
      line: test.location.line,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
    });
  }

  onEnd() {
    fs.writeFileSync('test-results.json', JSON.stringify(this.results, null, 2));
  }
}

export default JsonReporter;
```

```typescript
// playwright.config.ts
import JsonReporter from './reporters/json-reporter';

export default defineConfig({
  reporter: [
    ['html'],
    ['list'],
    [JsonReporter],
  ],
});
```

### Slack Notification Reporter

```typescript
// reporters/slack-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class SlackReporter implements Reporter {
  private failures: string[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      this.failures.push(`❌ ${test.title}\n${result.error?.message}`);
    }
  }

  async onEnd() {
    if (!process.env.SLACK_WEBHOOK_URL || this.failures.length === 0) return;

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `E2E Tests Failed (${this.failures.length}):\n\n${this.failures.join('\n\n')}`,
      }),
    });
  }
}

export default SlackReporter;
```

## Tag-Based Test Organization

```typescript
// Tag tests for selective execution
test('critical user flow @smoke @critical', async ({ page }) => {
  // Critical path test
});

test('admin feature @admin @slow', async ({ page }) => {
  // Admin-only test
});

test('visual regression @visual', async ({ page }) => {
  // Visual test
});
```

Run specific tags:

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run all except slow tests
npx playwright test --grep-invert @slow

# Run critical OR admin tests
npx playwright test --grep "@critical|@admin"
```

## Performance Testing

### Measure Page Load Time

```typescript
test('homepage loads within 2 seconds', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);

  console.log(`Page loaded in ${loadTime}ms`);
});
```

### Core Web Vitals

```typescript
test('measures Core Web Vitals', async ({ page }) => {
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const vitals: any = {};

        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
          }
          if (entry.entryType === 'largest-contentful-paint') {
            vitals.lcp = entry.startTime;
          }
        });

        resolve(vitals);
      }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

      setTimeout(() => resolve({}), 5000);
    });
  });

  console.log('Core Web Vitals:', metrics);
  expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
  expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
});
```

### Network Performance

```typescript
test('optimizes image loading', async ({ page }) => {
  const imageRequests: any[] = [];

  page.on('request', request => {
    if (request.resourceType() === 'image') {
      imageRequests.push(request);
    }
  });

  await page.goto('/gallery');
  await page.waitForLoadState('networkidle');

  // Check lazy loading
  const visibleImages = await page.getByRole('img').count();
  expect(imageRequests.length).toBeLessThan(visibleImages + 5);

  console.log(`Loaded ${imageRequests.length} images for ${visibleImages} visible`);
});
```

## Accessibility Testing

### Automated A11y Checks with axe-core

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test('form has proper labels and ARIA', async ({ page }) => {
  await page.goto('/contact');

  const results = await new AxeBuilder({ page })
    .include('#contact-form')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Keyboard Navigation

```typescript
test('modal can be navigated with keyboard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Modal' }).click();

  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();

  // Tab through interactive elements
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Submit' })).toBeFocused();

  // Escape closes modal
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('skip navigation link works', async ({ page }) => {
  await page.goto('/');

  // Tab to skip link
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to main content')).toBeFocused();

  // Activate skip link
  await page.keyboard.press('Enter');

  // Focus jumps to main content
  const main = page.getByRole('main');
  await expect(main).toBeFocused();
});
```

### Screen Reader Testing

```typescript
test('headings provide proper structure', async ({ page }) => {
  await page.goto('/blog');

  // Verify heading hierarchy
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBe(1);

  const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
  console.log('Heading structure:', headings);

  // First heading should be h1
  const firstHeading = await page.locator('h1').textContent();
  expect(firstHeading).toBeTruthy();
});

test('images have alt text', async ({ page }) => {
  await page.goto('/products');

  const images = page.locator('img');
  const count = await images.count();

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    expect(alt).toBeTruthy(); // All images must have alt text
    expect(alt!.length).toBeGreaterThan(0);
  }
});
```

## Mobile Testing Patterns

### Responsive Breakpoints

```typescript
const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

test.describe('Responsive Navigation', () => {
  test('mobile shows hamburger menu', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('link')).toBeHidden();
  });

  test('desktop shows full navigation', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.getByRole('navigation').getByRole('link').first()).toBeVisible();
  });
});
```

### Touch Gestures

```typescript
test('swipe to dismiss notification', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/notifications');

  const notification = page.getByRole('alert').first();
  const box = await notification.boundingBox();

  if (!box) throw new Error('Element not visible');

  // Swipe left
  await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 10, box.y + box.height / 2);
  await page.mouse.up();

  await expect(notification).toBeHidden();
});
```

## Test Organization Best Practices

### Directory Structure

```
tests/
├── e2e/
│   ├── auth/                    # Feature-based organization
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   └── password-reset.spec.ts
│   ├── checkout/
│   │   ├── guest-checkout.spec.ts
│   │   ├── member-checkout.spec.ts
│   │   └── payment.spec.ts
│   ├── admin/
│   │   ├── users.spec.ts
│   │   └── settings.spec.ts
│   └── smoke/                   # Critical path tests
│       └── critical-flows.spec.ts
├── fixtures/
│   ├── auth.ts                  # Reusable fixtures
│   ├── database.ts
│   └── factories.ts
├── pages/                       # Page Object Models
│   ├── LoginPage.ts
│   ├── CheckoutPage.ts
│   └── DashboardPage.ts
├── helpers/                     # Utility functions
│   ├── db-helpers.ts
│   └── test-helpers.ts
└── playwright.config.ts
```

### Naming Conventions

```typescript
// ✅ Descriptive test names
test('user can reset password via email link', async ({ page }) => {});
test('displays error when payment fails', async ({ page }) => {});
test('admin can delete inactive users', async ({ page }) => {});

// ❌ Vague test names
test('test login', async ({ page }) => {});
test('it works', async ({ page }) => {});
test('check button', async ({ page }) => {});
```

This covers advanced patterns for scaling E2E tests in large applications!
