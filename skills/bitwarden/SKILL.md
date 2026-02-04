---
name: bitwarden
description: Retrieves API keys, passwords, secrets from Bitwarden vault using bw CLI. Triggers on missing env variables, missing API keys, missing secrets, "secret not found", "env not set", or "use bw".
---

# Bitwarden CLI

Retrieve secrets when environment variables are missing.

## CRITICAL: Source .env Before EVERY bw Command

**EVERY `bw` command MUST be prefixed with sourcing .env** to load `BW_SESSION`:

```bash
# Standard prefix for ALL bw commands - copy this pattern exactly:
source .env 2>/dev/null; bw <command>
```

Example commands:
```bash
source .env 2>/dev/null; bw status
source .env 2>/dev/null; bw list items --search "telegram"
source .env 2>/dev/null; bw get password "item-name"
source .env 2>/dev/null; bw get notes "item-name"
```

If .env is in a parent directory, search up:
```bash
for dir in . .. ../.. ../../..; do [[ -f "$dir/.env" ]] && source "$dir/.env" && break; done; bw status
```

## Session Management

Check status (should show "unlocked" if BW_SESSION is valid):
```bash
source .env 2>/dev/null; bw status
```

If locked and BW_SESSION not in .env, unlock and save to .env:
```bash
echo "BW_SESSION=$(bw unlock --raw)" >> .env
```

## Finding API Keys

**API keys are often stored in notes** - either in a login item's notes field or as a standalone secure note.

1. **Search first** to find the right item:
   ```bash
   bw list items --search "openai"
   ```

2. **Check notes** - API keys are commonly here:
   ```bash
   bw get notes "item-name"
   ```

3. Check custom fields if not in notes:
   ```bash
   bw get item "item-name" | jq -r '.fields[] | select(.name=="API_KEY") | .value'
   ```

## Common Patterns

| Need | Command |
|------|---------|
| **Search items** | `bw list items --search "query"` |
| **Notes (API keys!)** | `bw get notes "name"` |
| Password | `bw get password "name"` |
| Username | `bw get username "name"` |
| TOTP | `bw get totp "name"` |
| Custom field | `bw get item "name" \| jq -r '.fields[] \| select(.name=="FIELD") \| .value'` |

## CLI Help

```
bw [options] [command]

Commands:
  login [email] [password]    Log into account
  unlock [password]           Unlock vault, returns session key
  lock                        Lock vault
  status                      Show vault status
  list <object>               List objects (items, folders, collections)
  get <object> <id>           Get object (item, username, password, totp, notes)
  sync                        Pull latest vault data
```
