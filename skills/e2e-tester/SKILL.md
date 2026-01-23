---
name: e2e-tester
description: "Frontend E2E testing using Playwriter. Triggers on: 'e2e test', 'end-to-end test', 'write e2e tests', 'test the UI', 'browser test', '/e2e-tester'"
references:
  - references/testing-patterns.md
  - references/playwright-best-practices.md
---

# E2E Tester

Write comprehensive end-to-end tests for frontend applications using Playwriter (Playwright). Focuses on user flows, accessibility, visual testing, and robust test patterns.

## When to Use

Trigger on:
- "Write e2e tests for the login flow"
- "Test the checkout process end-to-end"
- "Add browser tests for the dashboard"
- "Create end-to-end tests for user registration"
- "Test the UI with Playwright"

## Core Philosophy

E2E tests validate complete user journeys through the application. They should:
- Test real user scenarios, not implementation details
- Be resilient to UI changes (use semantic selectors)
- Run in isolated environments (no shared state between tests)
- Provide clear failure messages
- Balance coverage with execution speed

## Quick Start

### 1. Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate to starting point
    await page.goto('/login');
  });

  test('should allow user to login with valid credentials', async ({ page }) => {
    // Arrange: setup test data
    const email = 'test@example.com';
    const password = 'SecurePass123!';

    // Act: perform user actions
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Assert: verify expected outcomes
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
```

### 2. Selector Priority (Stable → Fragile)

**✅ Best (Accessibility-first):**
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email address')
page.getByPlaceholder('Enter your email')
page.getByText('Welcome back')
page.getByTitle('Close dialog')
```

**✅ Good (Test attributes):**
```typescript
page.getByTestId('submit-button')
page.locator('[data-testid="user-menu"]')
```

**⚠️ OK (Semantic HTML):**
```typescript
page.locator('button[type="submit"]')
page.locator('input[name="email"]')
```

**❌ Avoid (Fragile):**
```typescript
page.locator('.btn-primary')  // CSS classes change
page.locator('#submit')        // IDs may change
page.locator('div > button:nth-child(2)')  // Structure changes
```

### 3. Waiting Strategies

**✅ Automatic waiting (built-in):**
```typescript
// Playwright auto-waits for element to be visible, enabled, and stable
await page.getByRole('button').click();
await page.getByLabel('Name').fill('John');
await expect(page.getByText('Success')).toBeVisible();
```

**✅ Wait for network idle:**
```typescript
await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle');
```

**✅ Wait for specific state:**
```typescript
await page.getByRole('button').waitFor({ state: 'visible' });
await page.locator('.loading-spinner').waitFor({ state: 'hidden' });
```

**❌ Avoid arbitrary timeouts:**
```typescript
await page.waitForTimeout(3000);  // Fragile and slow
```

### 4. Accessibility Snapshots (Playwriter Feature)

Use `accessibilitySnapshot` to understand page structure and find elements:

```typescript
// Get overview of interactive elements
const snapshot = await page.evaluate(() =>
  globalThis.accessibilitySnapshot({ page })
);
console.log(snapshot);

// Search for specific elements
const buttons = await page.evaluate(() =>
  globalThis.accessibilitySnapshot({ page, search: /button|submit/i })
);

// Use aria-ref to interact (from Playwriter)
await page.locator('aria-ref=e13').click();
```

### 5. Test Organization

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── signup.spec.ts
│   │   └── logout.spec.ts
│   ├── user-flows/
│   │   ├── checkout.spec.ts
│   │   ├── product-search.spec.ts
│   │   └── user-profile.spec.ts
│   ├── fixtures/
│   │   ├── test-users.ts
│   │   └── test-data.ts
│   └── helpers/
│       ├── auth-helpers.ts
│       └── db-helpers.ts
└── playwright.config.ts
```

## Test Patterns

### Page Object Model (POM)

Encapsulate page interactions into reusable classes:

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async getErrorMessage() {
    return this.page.getByRole('alert').textContent();
  }
}

// login.spec.ts
test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password123');

  await expect(page).toHaveURL('/dashboard');
});
```

### Fixtures for Test Data

```typescript
// fixtures/test-fixtures.ts
import { test as base } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: Page;
  testUser: { email: string; password: string };
};

export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const user = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };
    await use(user);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/dashboard');
    await use(page);
  },
});

// Use in tests
test('user can view profile', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/profile');
  await expect(authenticatedPage.getByRole('heading')).toHaveText('My Profile');
});
```

### Network Interception

```typescript
test('displays loading state while fetching data', async ({ page }) => {
  // Delay API response
  await page.route('**/api/users', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.continue();
  });

  await page.goto('/users');
  await expect(page.getByTestId('loading-spinner')).toBeVisible();
});

test('handles API errors gracefully', async ({ page }) => {
  // Mock API error
  await page.route('**/api/users', route =>
    route.fulfill({ status: 500, body: 'Server Error' })
  );

  await page.goto('/users');
  await expect(page.getByText('Failed to load users')).toBeVisible();
});
```

### Visual Testing

```typescript
test('homepage matches design', async ({ page }) => {
  await page.goto('/');

  // Full page screenshot
  await expect(page).toHaveScreenshot('homepage.png');
});

test('button hover state', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Submit' });
  await button.hover();

  // Element screenshot
  await expect(button).toHaveScreenshot('button-hover.png');
});

test('mobile responsive layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('mobile-homepage.png');
});
```

## User Flow Testing

### Critical Path: E-commerce Checkout

```typescript
test.describe('Checkout Flow', () => {
  test('complete purchase journey', async ({ page }) => {
    // 1. Browse products
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // 2. Add to cart
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByText('Added to cart')).toBeVisible();

    // 3. View cart
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

    // 4. Proceed to checkout
    await page.getByRole('button', { name: 'Checkout' }).click();

    // 5. Fill shipping info
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('San Francisco');
    await page.getByLabel('ZIP Code').fill('94105');

    // 6. Fill payment info
    await page.getByLabel('Card Number').fill('4242424242424242');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    // 7. Submit order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // 8. Verify confirmation
    await expect(page).toHaveURL(/\/order\/[0-9]+/);
    await expect(page.getByText('Order Confirmed')).toBeVisible();
    await expect(page.getByText(/Order #\d+/)).toBeVisible();
  });
});
```

### Multi-step Form Validation

```typescript
test.describe('User Registration Form', () => {
  test('validates all fields before submission', async ({ page }) => {
    await page.goto('/signup');

    // Submit empty form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Verify validation messages
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();

    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Email').blur();
    await expect(page.getByText('Invalid email format')).toBeVisible();

    // Password too short
    await page.getByLabel('Password').fill('123');
    await page.getByLabel('Password').blur();
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();

    // Valid input
    await page.getByLabel('Email').fill('newuser@test.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByLabel('Confirm Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL('/welcome');
  });
});
```

## Assertions

### Common Assertions

```typescript
// URL assertions
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/products\/\d+/);

// Text content
await expect(page.getByRole('heading')).toHaveText('Dashboard');
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.locator('.error')).toContainText('Invalid');

// Element state
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('button')).toBeDisabled();
await expect(page.locator('.modal')).toBeVisible();
await expect(page.locator('.modal')).toBeHidden();

// Input values
await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
await expect(page.locator('input[name="age"]')).toBeEmpty();

// Attributes
await expect(page.getByRole('link')).toHaveAttribute('href', '/about');
await expect(page.locator('img')).toHaveAttribute('alt', 'Product photo');

// Counts
await expect(page.getByRole('listitem')).toHaveCount(5);

// CSS
await expect(page.locator('.button')).toHaveCSS('background-color', 'rgb(0, 0, 255)');

// Accessibility
await expect(page.getByRole('button')).toHaveAccessibleName('Submit Form');
```

### Custom Assertions

```typescript
// Check if element exists in viewport
async function expectInViewport(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const viewport = await locator.page().viewportSize();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}

test('sticky header visible while scrolling', async ({ page }) => {
  await page.goto('/long-page');
  const header = page.getByRole('banner');

  await expectInViewport(header);
  await page.evaluate(() => window.scrollBy(0, 1000));
  await expectInViewport(header);
});
```

## Debugging

### Interactive Mode

```bash
# Run tests in headed mode
npx playwright test --headed

# Debug with Playwright Inspector
npx playwright test --debug

# Run specific test
npx playwright test login.spec.ts --debug
```

### Console Logs

```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto('/app');

  // See current URL
  console.log('Current URL:', page.url());

  // See element state
  const button = page.getByRole('button');
  console.log('Button visible?', await button.isVisible());
  console.log('Button text:', await button.textContent());
});
```

### Screenshots on Failure

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
```

### Trace Viewer

```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Configuration

### Basic playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['list'],
    ...(process.env.CI ? [['github']] : []),
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Best Practices

### ✅ DO

- **Test user flows, not implementation**: Focus on what users do, not how components work internally
- **Use semantic selectors**: Prioritize `getByRole`, `getByLabel`, `getByText` for resilient tests
- **Isolate tests**: Each test should run independently (use `beforeEach` for setup)
- **Assert meaningful states**: Verify outcomes that matter to users
- **Handle async properly**: Trust Playwright's auto-waiting, avoid arbitrary timeouts
- **Use fixtures**: Share setup logic across tests with custom fixtures
- **Mock external services**: Control third-party APIs to avoid flaky tests
- **Test error states**: Verify error handling, validation, and edge cases

### ❌ DON'T

- **Don't test implementation details**: Avoid testing internal state or component methods
- **Don't use fragile selectors**: Avoid CSS classes, complex XPath, nth-child selectors
- **Don't share state between tests**: Each test should be independent
- **Don't use arbitrary waits**: Avoid `waitForTimeout(3000)` unless absolutely necessary
- **Don't ignore flakiness**: Fix flaky tests immediately, they erode confidence
- **Don't over-test**: Focus on critical user journeys, not every possible interaction
- **Don't skip accessibility**: Use semantic selectors to ensure accessibility

## Anti-Patterns

### ❌ Testing Implementation Details
```typescript
// BAD: Testing component internals
test('counter increments internal state', async ({ page }) => {
  await page.evaluate(() => window.__app__.counter.state.value);
  // Don't test internal state
});

// GOOD: Testing user-visible behavior
test('counter displays incremented value', async ({ page }) => {
  await page.getByRole('button', { name: 'Increment' }).click();
  await expect(page.getByTestId('counter-value')).toHaveText('1');
});
```

### ❌ Brittle Selectors
```typescript
// BAD: Fragile CSS selectors
await page.locator('.container > div.card:nth-child(2) .btn-primary').click();

// GOOD: Semantic selectors
await page.getByRole('article').filter({ hasText: 'Product' })
  .getByRole('button', { name: 'Add to Cart' }).click();
```

### ❌ Shared State Between Tests
```typescript
// BAD: Tests depend on order
let userId: string;

test('create user', async () => {
  userId = await createUser();
});

test('update user', async () => {
  await updateUser(userId); // Breaks if previous test fails
});

// GOOD: Independent tests with fixtures
test('update user', async ({ testUser }) => {
  await updateUser(testUser.id);
});
```

## Integration with Playwriter

Playwriter extends Playwright with:
- `accessibilitySnapshot()` - View page structure
- `screenshotWithAccessibilityLabels()` - Visual element labels
- `getReactSource()` - Find React component source
- Network interception helpers
- CDP debugging tools

```typescript
test('debug with accessibility snapshot', async ({ page }) => {
  await page.goto('/dashboard');

  // Get page structure
  const snapshot = await page.evaluate(() =>
    globalThis.accessibilitySnapshot({ page })
  );
  console.log(snapshot);

  // Find element by aria-ref
  await page.locator('aria-ref=e42').click();
});
```

See [Playwriter documentation](./../playwriter/SKILL.md) for advanced features.

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Quick Reference

| Task | Command |
|------|---------|
| Run all tests | `npx playwright test` |
| Run single file | `npx playwright test login.spec.ts` |
| Run in headed mode | `npx playwright test --headed` |
| Debug mode | `npx playwright test --debug` |
| Run specific browser | `npx playwright test --project=chromium` |
| Update snapshots | `npx playwright test --update-snapshots` |
| Generate tests | `npx playwright codegen http://localhost:3000` |
| View HTML report | `npx playwright show-report` |
| View trace | `npx playwright show-trace trace.zip` |

## Further Reading

- [testing-patterns.md](references/testing-patterns.md) - Advanced patterns (parallel execution, retries, custom reporters)
- [playwright-best-practices.md](references/playwright-best-practices.md) - Performance optimization, CI/CD, debugging strategies
