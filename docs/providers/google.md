---
summary: "Use Google Gemini via API key, Antigravity OAuth, or Gemini CLI OAuth in OpenClaw"
read_when:
  - You want to use Google Gemini models in OpenClaw
  - You want to use Gemini via OAuth instead of an API key
  - You want to set up Google as a model provider
title: "Google (Gemini)"
---

# Google (Gemini)

Google provides access to the **Gemini** model family. OpenClaw supports three
authentication methods: API key, Antigravity OAuth, and Gemini CLI OAuth.

## Option A: Gemini API key

**Best for:** direct API access with usage-based billing.
Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

### CLI setup

```bash
openclaw onboard --auth-choice gemini-api-key
```

### Config snippet

```json5
{
  env: { GEMINI_API_KEY: "AIza..." },
  agents: { defaults: { model: { primary: "google/gemini-3-pro-preview" } } },
}
```

## Option B: Google Antigravity OAuth

**Best for:** using Google credentials without managing API keys.

Antigravity OAuth is shipped as a bundled plugin (disabled by default).

### CLI setup (Antigravity OAuth)

```bash
# Enable the plugin
openclaw plugins enable google-antigravity-auth

# Log in
openclaw models auth login --provider google-antigravity --set-default
```

### Config snippet (Antigravity OAuth)

```json5
{
  agents: { defaults: { model: { primary: "google-antigravity/gemini-3-pro-preview" } } },
}
```

## Option C: Google Gemini CLI OAuth

**Best for:** using the Gemini CLI auth flow without managing API keys.

Gemini CLI OAuth is shipped as a bundled plugin (disabled by default).

### CLI setup (Gemini CLI OAuth)

```bash
# Enable the plugin
openclaw plugins enable google-gemini-cli-auth

# Log in
openclaw models auth login --provider google-gemini-cli --set-default
```

### Config snippet (Gemini CLI OAuth)

```json5
{
  agents: { defaults: { model: { primary: "google-gemini-cli/gemini-3-pro-preview" } } },
}
```

## Notes

- Model refs always use `provider/model` (see [/concepts/models](/concepts/models)).
- You do **not** paste a client id or secret into `openclaw.json`. The OAuth
  login flow stores tokens in auth profiles on the gateway host.
- Auth details and reuse rules are in [/concepts/oauth](/concepts/oauth).
- For multi-agent setups using Google alongside other providers, see
  [Multi-Provider Agents](/guides/multi-provider-agents).
