---
summary: "Use Anthropic Claude via API keys or setup-token in OpenClaw"
read_when:
  - You want to use Anthropic models in OpenClaw
  - You want setup-token instead of API keys
title: "Anthropic"
---

# Anthropic (Claude)

Anthropic builds the **Claude** model family and provides access via an API.
In OpenClaw you can authenticate with an API key or a **setup-token**.

## Option A: Anthropic API key

**Best for:** standard API access and usage-based billing.
Create your API key in the Anthropic Console.

### CLI setup

```bash
openclaw onboard
# choose: Anthropic API key

# or non-interactive
openclaw onboard --anthropic-api-key "$ANTHROPIC_API_KEY"
```

### Config snippet

```json5
{
  env: { ANTHROPIC_API_KEY: "sk-ant-..." },
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-6" } } },
}
```

## Prompt caching (Anthropic API)

OpenClaw supports Anthropic's prompt caching feature. This is **API-only**; subscription auth does not honor cache settings.

### Configuration

Use the `cacheRetention` parameter in your model config:

| Value   | Cache Duration | Description                         |
| ------- | -------------- | ----------------------------------- |
| `none`  | No caching     | Disable prompt caching              |
| `short` | 5 minutes      | Default for API Key auth            |
| `long`  | 1 hour         | Extended cache (requires beta flag) |

```json5
{
  agents: {
    defaults: {
      models: {
        "anthropic/claude-opus-4-6": {
          params: { cacheRetention: "long" },
        },
      },
    },
  },
}
```

### Defaults

When using Anthropic API Key authentication, OpenClaw automatically applies `cacheRetention: "short"` (5-minute cache) for all Anthropic models. You can override this by explicitly setting `cacheRetention` in your config.

### Legacy parameter

The older `cacheControlTtl` parameter is still supported for backwards compatibility:

- `"5m"` maps to `short`
- `"1h"` maps to `long`

We recommend migrating to the new `cacheRetention` parameter.

OpenClaw includes the `extended-cache-ttl-2025-04-11` beta flag for Anthropic API
requests; keep it if you override provider headers (see [/gateway/configuration](/gateway/configuration)).

## Option B: Claude Pro/Max subscription (setup-token)

**Best for:** using your Claude Pro or Max subscription instead of paying per-token API costs.

Claude Pro/Max subscriptions include access to Claude models through the Claude Code CLI. OpenClaw can use this subscription access via setup-tokens.

### Where to get a setup-token

Setup-tokens are created by the **Claude Code CLI**, not the Anthropic Console. You can run this on **any machine**:

```bash
claude setup-token
```

Paste the token into OpenClaw (wizard: **Anthropic token (paste setup-token)**), or run it on the gateway host:

```bash
openclaw models auth setup-token --provider anthropic
```

If you generated the token on a different machine, paste it:

```bash
openclaw models auth paste-token --provider anthropic
```

### CLI setup (Pro/Max subscription)

```bash
# Use Claude Pro/Max subscription during onboarding
openclaw onboard --auth-choice setup-token

# Or paste a setup-token during interactive onboarding
openclaw onboard
# choose: Anthropic Pro/Max subscription (setup-token)
```

### Config snippet (Pro/Max subscription)

When using a Claude Pro/Max subscription via setup-token, you don't need to specify any API key in the config:

```json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-6" } } },
}
```

The setup-token is stored securely in `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`.

## Notes

- Generate the setup-token with `claude setup-token` and paste it, or run `openclaw models auth setup-token` on the gateway host.
- If you see “OAuth token refresh failed …” on a Claude subscription, re-auth with a setup-token. See [/gateway/troubleshooting#oauth-token-refresh-failed-anthropic-claude-subscription](/gateway/troubleshooting#oauth-token-refresh-failed-anthropic-claude-subscription).
- Auth details + reuse rules are in [/concepts/oauth](/concepts/oauth).

## Troubleshooting

**401 errors / token suddenly invalid**

- Claude subscription auth can expire or be revoked. Re-run `claude setup-token`
  and paste it into the **gateway host**.
- If the Claude CLI login lives on a different machine, use
  `openclaw models auth paste-token --provider anthropic` on the gateway host.

**No API key found for provider "anthropic"**

- Auth is **per agent**. New agents don’t inherit the main agent’s keys.
- Re-run onboarding for that agent, or paste a setup-token / API key on the
  gateway host, then verify with `openclaw models status`.

**No credentials found for profile `anthropic:default`**

- Run `openclaw models status` to see which auth profile is active.
- Re-run onboarding, or paste a setup-token / API key for that profile.

**No available auth profile (all in cooldown/unavailable)**

- Check `openclaw models status --json` for `auth.unusableProfiles`.
- Add another Anthropic profile or wait for cooldown.

More: [/gateway/troubleshooting](/gateway/troubleshooting) and [/help/faq](/help/faq).
