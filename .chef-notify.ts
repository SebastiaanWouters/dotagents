#!/usr/bin/env bun
import { chef } from "./skills/chef/scripts/chef.ts";

const message = process.argv[2];
if (!message) {
  console.error("Usage: .chef-notify.ts <message>");
  process.exit(1);
}

await chef.notify(message);
