---
summary: "Use OpenAI via API keys, Codex subscription, or ChatGPT Plus/Pro subscription in OpenClaw"
read_when:
  - You want to use OpenAI models in OpenClaw
  - You want Codex subscription auth instead of API keys
  - You want ChatGPT Plus or Pro subscription auth
title: "OpenAI"
---

# OpenAI

OpenAI provides developer APIs for GPT models. OpenClaw supports **ChatGPT Plus/Pro sign-in** for subscription
access, **Codex OAuth** for Codex subscription access, or **API key** sign-in for usage-based access.

## Option A: OpenAI API key (OpenAI Platform)

**Best for:** direct API access and usage-based billing.
Get your API key from the OpenAI dashboard.

### CLI setup

```bash
openclaw onboard --auth-choice openai-api-key
# or non-interactive
openclaw onboard --openai-api-key "$OPENAI_API_KEY"
```

### Config snippet

```json5
{
  env: { OPENAI_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "openai/gpt-5.1-codex" } } },
}
```

## Option B: ChatGPT Plus/Pro subscription (OAuth)

**Best for:** using your ChatGPT Plus or Pro subscription instead of an API key.
Sign in with your ChatGPT account to authenticate via OAuth.

### CLI setup (ChatGPT Plus/Pro OAuth)

```bash
# Run ChatGPT Plus/Pro OAuth in the wizard
openclaw onboard --auth-choice openai-chatgpt-plus

# Or run OAuth directly
openclaw models auth login --provider openai-codex
```

### Config snippet (ChatGPT Plus/Pro subscription)

```json5
{
  agents: { defaults: { model: { primary: "openai-codex/gpt-5.3-codex" } } },
}
```

## Option C: OpenAI Code (Codex) subscription

**Best for:** using ChatGPT/Codex subscription access instead of an API key.
Codex cloud requires ChatGPT sign-in, while the Codex CLI supports ChatGPT or API key sign-in.

### CLI setup (Codex OAuth)

```bash
# Run Codex OAuth in the wizard
openclaw onboard --auth-choice openai-codex

# Or run OAuth directly
openclaw models auth login --provider openai-codex
```

### Config snippet (Codex subscription)

```json5
{
  agents: { defaults: { model: { primary: "openai-codex/gpt-5.3-codex" } } },
}
```

## Notes

- Model refs always use `provider/model` (see [/concepts/models](/concepts/models)).
- Auth details + reuse rules are in [/concepts/oauth](/concepts/oauth).
