---
summary: "Consolidate multiple VPS instances into one gateway with multiple agents and model providers"
read_when:
  - You run separate servers for different AI providers and want to consolidate
  - You want a multi-agent team using OpenAI, Anthropic, and Google models together
  - You need a guide for setting up a multi-model, multi-agent system
title: "Multi-Agent Multi-Model Setup"
---

# Multi-agent, multi-model setup

Running separate VPS instances for each model provider is unnecessary. A single
OpenClaw gateway can host multiple agents, each wired to a different provider
(OpenAI, Anthropic, Google, etc.), all on one server.

This guide walks through consolidating three separate setups into one gateway
with a coordinated multi-agent team.

## Why consolidate

| Separate VPS per provider               | One gateway, multiple agents                          |
| --------------------------------------- | ----------------------------------------------------- |
| 3 servers to maintain and pay for       | 1 server, 1 process                                   |
| No coordination between agents          | Agents can hand off tasks via sub-agents               |
| Duplicate config and channel accounts   | Shared channel accounts with per-agent routing         |
| 3x the ops overhead (updates, restarts) | One `openclaw gateway run`, one update cycle           |

## Prerequisites

- OpenClaw installed and onboarded -- see [Getting Started](/start/getting-started)
- API keys or auth for each provider you want to use (see [Model Providers](/concepts/model-providers))
- One VPS (or local machine) with enough resources for a single gateway

## Step 1: Define your agents

Each agent gets its own workspace, auth profiles, and model. Add them to
`~/.openclaw/openclaw.json`:

```json5
{
  agents: {
    list: [
      {
        id: "openai-agent",
        name: "OpenAI Agent",
        default: true,
        workspace: "~/.openclaw/workspace-openai",
        model: "openai/gpt-5.1-codex",
      },
      {
        id: "anthropic-agent",
        name: "Anthropic Agent",
        workspace: "~/.openclaw/workspace-anthropic",
        model: "anthropic/claude-sonnet-4-5",
      },
      {
        id: "google-agent",
        name: "Google Agent",
        workspace: "~/.openclaw/workspace-google",
        model: "google-antigravity/gemini-2.5-pro",
      },
    ],
  },
}
```

Or use the agent wizard to add each one interactively:

```bash
openclaw agents add openai-agent
openclaw agents add anthropic-agent
openclaw agents add google-agent
```

Verify the setup:

```bash
openclaw agents list --bindings
```

## Step 2: Set up auth for each agent

Each agent has its own auth profiles in
`~/.openclaw/agents/<agentId>/agent/auth-profiles.json`. Set up credentials
per agent:

```bash
# OpenAI agent
openclaw models auth add-key --provider openai --agent openai-agent

# Anthropic agent
openclaw models auth add-key --provider anthropic --agent anthropic-agent
# Or use setup-token:
# openclaw models auth paste-token --provider anthropic --agent anthropic-agent

# Google agent (OAuth)
openclaw models auth login --provider google-antigravity --agent google-agent
# Or use API key:
# openclaw models auth add-key --provider google-gemini-cli --agent google-agent
```

For provider-specific auth details, see the individual provider docs:
- [OpenAI](/providers/openai)
- [Anthropic](/providers/anthropic)
- [Google](/providers/google)

## Step 3: Route messages to agents

Use [bindings](/concepts/multi-agent#routing-rules-how-messages-pick-an-agent) to
control which agent handles which messages. Here are common patterns:

### Route by channel

Each channel goes to a different agent:

```json5
{
  bindings: [
    { agentId: "openai-agent", match: { channel: "whatsapp" } },
    { agentId: "anthropic-agent", match: { channel: "telegram" } },
    { agentId: "google-agent", match: { channel: "discord" } },
  ],
}
```

### Route by peer (DM or group)

Keep one channel but route specific conversations to specific agents:

```json5
{
  bindings: [
    // Coding questions go to Anthropic
    {
      agentId: "anthropic-agent",
      match: { channel: "whatsapp", peer: { kind: "group", id: "coding-group@g.us" } },
    },
    // Research goes to Google
    {
      agentId: "google-agent",
      match: { channel: "whatsapp", peer: { kind: "direct", id: "+15551234567" } },
    },
    // Everything else goes to OpenAI (default)
    { agentId: "openai-agent", match: { channel: "whatsapp" } },
  ],
}
```

More routing options: [Multi-Agent Routing](/concepts/multi-agent).

## Step 4: Give each agent a personality

Each agent has its own workspace with its own `AGENTS.md` (or `SOUL.md`). Use
this to specialize each agent's behavior:

```bash
# Create workspace files for each agent
echo "You are a coding specialist. Use your strengths in code generation and debugging." \
  > ~/.openclaw/workspace-openai/AGENTS.md

echo "You are a research and analysis specialist. Provide thorough, well-reasoned responses." \
  > ~/.openclaw/workspace-anthropic/AGENTS.md

echo "You are a creative and multimodal specialist. Leverage your vision and reasoning capabilities." \
  > ~/.openclaw/workspace-google/AGENTS.md
```

## Step 5: Enable agent coordination

To build a real team that ships, agents need to talk to each other. Enable
agent-to-agent communication and sub-agents:

### Agent-to-agent messaging

Allow agents to send messages to each other:

```json5
{
  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["openai-agent", "anthropic-agent", "google-agent"],
    },
  },
}
```

### Sub-agents for parallel work

Let agents spawn sub-agents to delegate tasks. This is the key to building a
team that ships -- one agent can orchestrate work across models:

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,         // Allow orchestrator pattern
        maxChildrenPerAgent: 5,
        maxConcurrent: 8,
      },
    },
    list: [
      {
        id: "openai-agent",
        // ...
        subagents: {
          allowAgents: ["anthropic-agent", "google-agent"],
        },
      },
      {
        id: "anthropic-agent",
        // ...
        subagents: {
          allowAgents: ["openai-agent", "google-agent"],
        },
      },
      {
        id: "google-agent",
        // ...
        subagents: {
          allowAgents: ["openai-agent", "anthropic-agent"],
        },
      },
    ],
  },
}
```

Now any agent can spawn a sub-agent on a different model. For example, the
Anthropic agent can ask the OpenAI agent to generate code, or the Google agent
to analyze an image.

See [Sub-Agents](/tools/subagents) for the full sub-agent reference.

## Step 6: Add model fallbacks

Set up cross-provider fallbacks so if one provider goes down, the agent falls
back to another:

```json5
{
  agents: {
    list: [
      {
        id: "openai-agent",
        model: {
          primary: "openai/gpt-5.1-codex",
          fallbacks: ["anthropic/claude-sonnet-4-5", "google-antigravity/gemini-2.5-pro"],
        },
      },
      {
        id: "anthropic-agent",
        model: {
          primary: "anthropic/claude-sonnet-4-5",
          fallbacks: ["openai/gpt-5.1-codex", "google-antigravity/gemini-2.5-pro"],
        },
      },
      {
        id: "google-agent",
        model: {
          primary: "google-antigravity/gemini-2.5-pro",
          fallbacks: ["anthropic/claude-sonnet-4-5", "openai/gpt-5.1-codex"],
        },
      },
    ],
  },
}
```

For cross-provider fallbacks to work, each agent needs auth profiles for all
providers in its fallback chain. Copy or set up credentials for each:

```bash
# Give the OpenAI agent Anthropic fallback credentials
openclaw models auth add-key --provider anthropic --agent openai-agent
```

See [Model Failover](/concepts/model-failover) for how rotation and cooldowns work.

## Full example config

Here is a complete `~/.openclaw/openclaw.json` putting it all together:

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,
        maxChildrenPerAgent: 5,
        maxConcurrent: 8,
      },
    },
    list: [
      {
        id: "openai-agent",
        name: "OpenAI Agent",
        default: true,
        workspace: "~/.openclaw/workspace-openai",
        model: {
          primary: "openai/gpt-5.1-codex",
          fallbacks: ["anthropic/claude-sonnet-4-5"],
        },
        subagents: {
          allowAgents: ["anthropic-agent", "google-agent"],
        },
      },
      {
        id: "anthropic-agent",
        name: "Anthropic Agent",
        workspace: "~/.openclaw/workspace-anthropic",
        model: {
          primary: "anthropic/claude-sonnet-4-5",
          fallbacks: ["openai/gpt-5.1-codex"],
        },
        subagents: {
          allowAgents: ["openai-agent", "google-agent"],
        },
      },
      {
        id: "google-agent",
        name: "Google Agent",
        workspace: "~/.openclaw/workspace-google",
        model: {
          primary: "google-antigravity/gemini-2.5-pro",
          fallbacks: ["anthropic/claude-sonnet-4-5"],
        },
        subagents: {
          allowAgents: ["openai-agent", "anthropic-agent"],
        },
      },
    ],
  },

  bindings: [
    { agentId: "openai-agent", match: { channel: "whatsapp" } },
    { agentId: "anthropic-agent", match: { channel: "telegram" } },
    { agentId: "google-agent", match: { channel: "discord" } },
  ],

  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["openai-agent", "anthropic-agent", "google-agent"],
    },
  },

  channels: {
    whatsapp: {
      allowFrom: ["+15555550123"],
    },
  },
}
```

## Verifying the setup

After configuring, verify everything is wired correctly:

```bash
# Check agents and their bindings
openclaw agents list --bindings

# Check model auth for each agent
openclaw models list --agent openai-agent
openclaw models list --agent anthropic-agent
openclaw models list --agent google-agent

# Check channel status
openclaw channels status --probe

# Start the gateway
openclaw gateway run
```

## Tips for a productive multi-agent team

- **Specialize agents by strength.** OpenAI models often excel at code
  generation, Anthropic at reasoning and analysis, Google at multimodal tasks.
  Assign work accordingly.

- **Use sub-agents for delegation.** The main agent can spawn sub-agents on
  different models for specific tasks, then synthesize results. See the
  [orchestrator pattern](/tools/subagents#nested-sub-agents).

- **Set per-agent tool policies.** Restrict dangerous tools on agents that
  don't need them. See
  [Per-Agent Sandbox and Tools](/tools/multi-agent-sandbox-tools).

- **Use model fallbacks.** Cross-provider fallbacks keep your team running even
  when one provider has an outage.

- **Monitor costs.** Each agent and sub-agent has its own token usage. Use
  cheaper models for sub-agent workers and keep expensive models for the
  primary agent. Configure via `agents.defaults.subagents.model`.

## Next steps

- [Multi-Agent Routing](/concepts/multi-agent) -- full routing and binding reference
- [Sub-Agents](/tools/subagents) -- parallel work and orchestrator pattern
- [Model Providers](/concepts/model-providers) -- all supported providers and auth methods
- [Model Failover](/concepts/model-failover) -- auth rotation and fallback behavior
- [Configuration Examples](/gateway/configuration-examples) -- more config patterns
