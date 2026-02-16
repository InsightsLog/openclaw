---
summary: "Run three isolated agents with different providers: Codex OAuth, Anthropic, and Google, plus GitHub Copilot for cost efficiency"
read_when:
  - You want multiple agents each using a different model provider
  - You want to combine Codex OAuth, Anthropic, and Google in one gateway
  - You want cost-efficient multi-provider routing with GitHub Copilot
title: "Multi-Provider Agents"
---

# Multi-Provider Agents

This guide walks through running **three isolated agents** in one OpenClaw
gateway, each backed by a different model provider:

| Agent    | Provider                   | Auth method           | Use case               |
| -------- | -------------------------- | --------------------- | ---------------------- |
| `codex`  | OpenAI Codex (OAuth)       | ChatGPT subscription  | Coding tasks           |
| `claude` | Anthropic                  | API key or OAuth      | Deep reasoning         |
| `gemini` | Google Gemini              | API key               | Fast multimodal        |

An optional fourth agent uses **GitHub Copilot** for cost-efficient Opus-class
work via your GitHub subscription.

## Prerequisites

- OpenClaw installed and running (`openclaw gateway run`).
- Auth credentials for each provider (see provider-specific setup below).

## Step 1: Authenticate each provider

Run onboarding or direct login for each provider. Each agent stores auth in its
own `agentDir`, so credentials never collide.

```bash
# Agent 1: Codex OAuth (ChatGPT subscription)
openclaw onboard --auth-choice openai-codex

# Agent 2: Anthropic (API key)
openclaw onboard --auth-choice anthropic-api-key

# Agent 3: Google Gemini (API key)
openclaw onboard --auth-choice gemini-api-key
```

<Tip>
You can also authenticate per-agent later with
`openclaw models auth login --provider <provider>`. Auth profiles are per-agent,
so new agents need their own credentials. See [OAuth](/concepts/oauth).
</Tip>

## Step 2: Add agents

Use the agent wizard to create three isolated agents:

```bash
openclaw agents add codex
openclaw agents add claude
openclaw agents add gemini
```

Each agent gets its own workspace, session store, and auth profiles. See
[Multi-Agent Routing](/concepts/multi-agent) for details.

## Step 3: Configure the gateway

Add the following to `~/.openclaw/openclaw.json` (JSON5):

```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-5" },
    },
    list: [
      {
        id: "codex",
        name: "Codex",
        workspace: "~/.openclaw/workspace-codex",
        model: { primary: "openai-codex/gpt-5.3-codex" },
      },
      {
        id: "claude",
        name: "Claude",
        workspace: "~/.openclaw/workspace-claude",
        model: {
          primary: "anthropic/claude-opus-4-6",
          fallbacks: ["anthropic/claude-sonnet-4-5"],
        },
      },
      {
        id: "gemini",
        name: "Gemini",
        workspace: "~/.openclaw/workspace-gemini",
        model: { primary: "google/gemini-3-pro-preview" },
      },
    ],
  },

  // Route messages to agents by channel or peer.
  bindings: [
    { agentId: "codex", match: { channel: "slack" } },
    { agentId: "claude", match: { channel: "telegram" } },
    { agentId: "gemini", match: { channel: "whatsapp" } },
  ],
}
```

### What this does

- **Codex agent** handles Slack messages using OpenAI Codex OAuth (your ChatGPT
  subscription, no API key needed).
- **Claude agent** handles Telegram messages using Anthropic Opus with Sonnet as
  fallback.
- **Gemini agent** handles WhatsApp messages using Google Gemini.
- Each agent has an isolated workspace, sessions, and auth profile.

## Adding GitHub Copilot for cost-efficient usage

GitHub Copilot provides access to models through your GitHub subscription, making
it a cost-efficient option. Add a fourth agent:

```bash
# Authenticate with GitHub Copilot (device flow)
openclaw models auth login-github-copilot

# Add the agent
openclaw agents add copilot
```

Then add it to your config:

```json5
{
  agents: {
    list: [
      // ... existing agents ...
      {
        id: "copilot",
        name: "Copilot",
        workspace: "~/.openclaw/workspace-copilot",
        model: { primary: "github-copilot/gpt-4o" },
      },
    ],
  },

  bindings: [
    // ... existing bindings ...

    // Route Discord to the cost-efficient Copilot agent.
    { agentId: "copilot", match: { channel: "discord" } },
  ],
}
```

<Tip>
GitHub Copilot model availability depends on your plan. Run
`openclaw models list` to see available models, or try
`github-copilot/gpt-4.1` if `gpt-4o` is not available.
</Tip>

## Full four-agent config

Here is the complete configuration with all four agents:

```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-5" },
    },
    list: [
      {
        id: "codex",
        name: "Codex",
        workspace: "~/.openclaw/workspace-codex",
        model: { primary: "openai-codex/gpt-5.3-codex" },
      },
      {
        id: "claude",
        name: "Claude",
        workspace: "~/.openclaw/workspace-claude",
        model: {
          primary: "anthropic/claude-opus-4-6",
          fallbacks: ["anthropic/claude-sonnet-4-5"],
        },
      },
      {
        id: "gemini",
        name: "Gemini",
        workspace: "~/.openclaw/workspace-gemini",
        model: { primary: "google/gemini-3-pro-preview" },
      },
      {
        id: "copilot",
        name: "Copilot",
        workspace: "~/.openclaw/workspace-copilot",
        model: { primary: "github-copilot/gpt-4o" },
      },
    ],
  },

  bindings: [
    { agentId: "codex", match: { channel: "slack" } },
    { agentId: "claude", match: { channel: "telegram" } },
    { agentId: "gemini", match: { channel: "whatsapp" } },
    { agentId: "copilot", match: { channel: "discord" } },
  ],
}
```

## Peer-based routing (optional)

Instead of routing by channel, route specific DMs or groups to specific agents:

```json5
{
  bindings: [
    // Peer bindings win over channel-wide rules.
    {
      agentId: "claude",
      match: {
        channel: "whatsapp",
        peer: { kind: "direct", id: "+15551234567" },
      },
    },
    // Everything else on WhatsApp goes to Gemini.
    { agentId: "gemini", match: { channel: "whatsapp" } },
  ],
}
```

## Verify

```bash
# List agents and their bindings
openclaw agents list --bindings

# Check model and auth status
openclaw models status

# Check channel connectivity
openclaw channels status --probe
```

## Next steps

- [Multi-Agent Routing](/concepts/multi-agent) for routing rules, sandbox
  isolation, and per-agent tool policies.
- [Model Failover](/concepts/model-failover) for automatic fallback between
  providers.
- [OpenAI (Codex OAuth)](/providers/openai) for Codex subscription setup.
- [Anthropic](/providers/anthropic) for API key, OAuth, and setup-token options.
- [Google (Gemini)](/providers/google) for Gemini API key and OAuth options.
- [GitHub Copilot](/providers/github-copilot) for device login and model
  selection.
