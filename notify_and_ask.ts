#!/usr/bin/env bun
import { chef } from "./.claude/skills/chef/scripts/chef.ts";

try {
  await chef.notify(
    "🎯 Skill Ideas Ready!\n\n" +
    "I've analyzed your skill library and prepared 3 innovative ideas:\n\n" +
    "1️⃣ API Architect - REST/GraphQL API design with OpenAPI specs\n" +
    "2️⃣ Test Master - Comprehensive testing strategy & organization\n" +
    "3️⃣ Schema Wizard - Database design & migration expert\n\n" +
    "Reply with: 1, 2, or 3"
  );

  const response = await chef.ask("Which skill should I implement? (1, 2, or 3)");
  console.log(response);
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
}
