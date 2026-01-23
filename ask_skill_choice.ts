#!/usr/bin/env bun
import { chef } from "./.claude/skills/chef/scripts/chef.ts";

const idx = await chef.choice(
  "I've analyzed your skill library and found some exciting gaps! Here are 3 innovative skill ideas:\n\n" +
  "**1. API Architect** 🏗️\n" +
  "Design & document REST/GraphQL APIs with OpenAPI specs, endpoint planning, versioning strategies, and automatic documentation generation. Fills gap: No API design skill exists.\n\n" +
  "**2. Test Master** 🧪\n" +
  "Comprehensive testing skill: unit/integration/e2e test strategy, test organization, coverage analysis, test data generation, and testing anti-patterns. Fills gap: No dedicated testing skill.\n\n" +
  "**3. Schema Wizard** 🗄️\n" +
  "Database design expert: schema design, migration planning, indexing strategies, data modeling, and normalization guidance. Works with SQL, Prisma, Drizzle, etc. Fills gap: No DB design skill.\n\n" +
  "Which skill sounds most useful?",
  ["API Architect", "Test Master", "Schema Wizard"]
);

console.log(idx);
