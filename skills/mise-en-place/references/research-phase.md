# Phase 2: Research & Prime Compound

After spec is confirmed, research all chosen technologies and prime the compound knowledge base.

## Extract Stack from Spec

Parse SPEC.md to extract all technologies:

```typescript
const stack = {
  framework: "SvelteKit",           // from Full-Stack / Framework
  frontend: "Svelte",               // from Frontend
  router: "built-in",               // from Router
  bundler: "Vite",                  // from Bundler
  styling: "Tailwind v4",           // from CSS
  components: "shadcn-svelte",      // from Components
  database: "Convex",               // from Database
  auth: "Better Auth",              // from Auth Provider
  linting: "Biome",                 // from Linting/Formatting
  testing: ["Vitest", "Playwright"] // from Testing
};
```

## Research Topics

For each technology, use `web_search` + `read_web_page`:

```typescript
const researchTopics = [
  // Framework setup & patterns
  `${stack.framework} project setup best practices`,
  `${stack.framework} folder structure conventions`,
  `${stack.framework} ${stack.frontend} integration`,
  
  // Component library integration
  `${stack.components} installation ${stack.framework}`,
  `${stack.components} theming customization`,
  
  // Database patterns
  `${stack.database} ${stack.framework} integration`,
  `${stack.database} schema design best practices`,
  `${stack.database} real-time subscriptions`,
  
  // Auth setup
  `${stack.auth} ${stack.framework} setup guide`,
  `${stack.auth} protected routes`,
  
  // Tooling configuration
  `${stack.linting} configuration ${stack.framework}`,
  `${stack.testing[0]} ${stack.framework} setup`,
  `${stack.testing[1]} ${stack.framework} e2e testing`,
  
  // Combining technologies
  `${stack.framework} ${stack.database} ${stack.auth} example`,
];
```

## Store in Compound

```bash
compound store "SvelteKit + Convex Integration" << 'EOF'
## Setup
1. Install @convex-dev/svelte
2. Create convex/ directory
3. Define schema in convex/schema.ts

## Best Practices
- Use load functions for initial data
- Subscribe to queries in components
- Handle optimistic updates

## Code Patterns
```svelte
<script>
  import { useQuery } from '@convex-dev/svelte';
  const tasks = useQuery(api.tasks.list);
</script>
```
EOF
```

## Research Checklist

For each stack item, ensure compound contains:

- [ ] **Installation/Setup** — exact commands and config files
- [ ] **Project Structure** — where files go, naming conventions  
- [ ] **API Patterns** — how to use core APIs
- [ ] **Integration Points** — how it connects with other stack items
- [ ] **Common Gotchas** — pitfalls and solutions
- [ ] **Code Examples** — copy-paste ready snippets

## Notify User

```typescript
await chef.send("📚 Research complete! Primed compound with:");
await chef.send(`
• ${stack.framework} setup & patterns
• ${stack.components} integration
• ${stack.database} schema & queries
• ${stack.auth} configuration
• ${stack.linting} + ${stack.testing.join('/')} setup
• Cross-stack integration examples
`);
```
