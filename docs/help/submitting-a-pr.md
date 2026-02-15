# Submitting a Pull Request

This guide explains how to contribute code changes to OpenClaw by submitting a pull request (PR).

## Quick Reference

- **Small fixes & bugs** → Open a PR directly
- **New features or architecture changes** → Start a [GitHub Discussion](https://github.com/openclaw/openclaw/discussions) or ask in [Discord](https://discord.gg/clawd) first
- **Questions** → Ask in Discord #setup-help

## Before You Start

### 1. Discuss First (For Major Changes)

If you're planning to:
- Add a new feature
- Change architecture or design
- Refactor significant portions of code
- Modify core behavior

**Please discuss it first** in a GitHub Discussion or Discord. This helps ensure your work aligns with the project's direction and avoids wasted effort.

For bug fixes and small improvements, you can go straight to opening a PR.

### 2. Set Up Your Development Environment

Make sure you have:
- **Node ≥22** installed
- Fork the repository on GitHub (if you haven't already)
- Clone **your fork**: `git clone https://github.com/YOUR-USERNAME/openclaw.git`
- Install dependencies: `pnpm install`
- Build the project: `pnpm build`

See the [Development Setup](https://docs.openclaw.ai/install/index) for more details.

If you're maintaining a fork with custom changes, see [Syncing Your Fork](https://docs.openclaw.ai/help/syncing-fork) to learn how to keep it up-to-date with upstream.

## Preparing Your PR

### 1. Create a Feature Branch

```bash
git checkout -b my-feature-name
```

Use a descriptive branch name that reflects what you're working on.

### 2. Make Your Changes

- Keep changes focused on a single issue or feature
- Follow the existing code style and conventions
- Add tests for new functionality
- Update documentation if needed

### 3. Test Locally

Before submitting, verify your changes work:

```bash
# Run the full test suite
pnpm test

# Type-check the code
pnpm tsgo

# Lint and format
pnpm check

# Build to ensure no compilation errors
pnpm build
```

All of these checks must pass. If you have issues, fix them before submitting.

### 4. Test with Your OpenClaw Instance

Actually run the code with your OpenClaw setup:
- Start the gateway: `pnpm openclaw gateway`
- Exercise the changed functionality
- Verify it works as expected in real scenarios
- Test edge cases

### 5. Commit Your Changes

Use clear, action-oriented commit messages:

```bash
git add .
git commit -m "CLI: add verbose flag to send command"
```

Good commit message examples:
- `Gateway: fix race condition in channel startup`
- `Telegram: add support for inline keyboard buttons`
- `Docs: update installation guide for Docker`

### 6. Push to Your Fork

```bash
git push origin my-feature-name
```

## Opening the Pull Request

### 1. Use the PR Template

When you open a PR on GitHub, you'll see a template. **Please fill it out completely**. The template asks for:

#### Summary
- **Problem:** What issue are you fixing?
- **Why it matters:** Impact on users or the project
- **What changed:** High-level description of your changes
- **What did NOT change:** Scope boundaries to set expectations

#### Change Type
Check all that apply: Bug fix, Feature, Refactor, Docs, Security hardening, Chore/infra

#### Scope
Which areas of the codebase does this touch? (Gateway, Skills, Auth, Memory, Integrations, API, UI, CI/CD)

#### Linked Issue
If this fixes or relates to an issue, reference it:
- `Closes #123`
- `Related #456`

#### User-Visible Changes
List any changes users will notice (new commands, changed behavior, config changes). If none, write "None".

#### Security Impact
Answer these questions:
- New permissions/capabilities?
- Secrets/tokens handling changed?
- New/changed network calls?
- Command/tool execution surface changed?
- Data access scope changed?

If you answer "Yes" to any, explain the risk and mitigation.

#### Repro + Verification
Provide:
- Your environment (OS, runtime, model/provider)
- Steps to reproduce the original issue
- Expected vs actual behavior
- Evidence: logs, screenshots, test results

#### Human Verification
**Critical:** Describe what you personally tested (not just CI):
- Scenarios you verified
- Edge cases you checked
- What you did NOT verify

#### Compatibility
- Is it backward compatible?
- Any config/env changes needed?
- Migration steps required?

### 2. Keep PRs Focused

One PR should address one thing. If you're fixing multiple unrelated issues, open separate PRs.

### 3. Describe What & Why

Don't just say "fixed bug" or "added feature". Explain:
- **What** the problem was
- **Why** this solution is the right approach
- **How** you tested it

## AI-Assisted PRs

OpenClaw welcomes AI-assisted contributions! 🤖

If you used AI tools (Claude, Codex, GitHub Copilot, etc.) to help write the code:

### Requirements for AI-Assisted PRs

1. **Mark it clearly** in the PR title or description:
   - ✅ "AI-assisted: Add verbose logging option"
   - ✅ "(Claude) Refactor session management"

2. **Indicate testing level:**
   - Untested
   - Lightly tested (ran it once, seems to work)
   - Fully tested (comprehensive testing, edge cases covered)

3. **Include context (strongly encouraged):**
   - Share the prompts you used
   - Attach session logs if helpful
   - Explain the AI's approach if relevant

4. **Confirm understanding:**
   - You should understand what the code does
   - Be able to explain why this approach was chosen
   - Can answer questions about the implementation

### Why We Ask

AI-generated code is great, but it helps reviewers to know:
- Where to look more carefully
- What testing was done
- If unusual patterns have a reason

**AI PRs are first-class citizens.** We just need transparency so we can review effectively.

## What Maintainers Look For

When reviewing your PR, maintainers will check:

### Code Quality
- **Types:** Strict TypeScript, avoid `any`
- **Clarity:** Code should be readable and maintainable
- **Reuse:** Use existing utilities instead of duplicating code
- **Scope:** Fix root causes, not just symptoms

### Testing
- New features should have tests
- Tests should be meaningful, not just for coverage
- Manual verification is required (CI passing isn't enough)

### Security
- Input validation for external data (CLI args, env vars, network payloads)
- No hardcoded secrets or credentials
- Consider abuse scenarios and edge cases

### Documentation
- Update docs if behavior changes
- Add inline comments for complex logic
- Keep changelog updated

### Process
- CI checks must pass
- No merge conflicts
- Follows commit conventions
- PR template filled out

## After You Submit

### CI Checks

Your PR will run automated checks:
- Build verification
- Linter and formatter
- Test suite
- Type checking

If any fail, you'll need to fix them. Check the CI logs for details.

### Code Review

A maintainer will review your PR. They may:
- Request changes or clarifications
- Suggest alternative approaches
- Ask questions about implementation details
- Test your changes in their environment

**Be responsive:** If a maintainer asks questions, try to respond within a few days.

### Making Changes

If changes are requested:

```bash
# Make the changes
git add .
git commit -m "Address review feedback"
git push origin my-feature-name
```

The PR will update automatically.

### Merge

Once approved and all checks pass:
- Maintainers will merge your PR (usually as a squash merge)
- Your contribution will be credited in the commit
- You'll be added to the clawtributors list in the README

## Common Issues

### "CI is failing"
- Check the CI logs on GitHub
- Common issues: linting, test failures, type errors
- Run `pnpm check` and `pnpm test` locally to catch these

### "Merge conflicts"
- Update your branch from main:
  ```bash
  git fetch origin
  git rebase origin/main
  # Resolve conflicts
  git push --force-with-lease origin my-feature-name
  ```

### "My PR isn't getting reviewed"
- Be patient; maintainers are volunteers
- Ping in Discord #contributions channel if it's been >1 week
- Make sure CI is passing (PRs with failing CI get deprioritized)

### "I don't know how to test this"
- Ask in Discord for guidance
- Review existing tests in the codebase for examples
- Check [Testing documentation](https://docs.openclaw.ai/help/testing)

## Resources

### Documentation
- [Contributing Guide](https://github.com/openclaw/openclaw/blob/main/CONTRIBUTING.md)
- [Syncing Your Fork](https://docs.openclaw.ai/help/syncing-fork) - Keep your fork up-to-date with upstream
- [Testing Guide](https://docs.openclaw.ai/help/testing)
- [Development Setup](https://docs.openclaw.ai/install/index)

### Community
- [GitHub Discussions](https://github.com/openclaw/openclaw/discussions)
- [Discord](https://discord.gg/clawd) - #contributions channel
- [GitHub Issues](https://github.com/openclaw/openclaw/issues)

### Templates
- [PR Template](https://github.com/openclaw/openclaw/blob/main/.github/pull_request_template.md)
- [Issue Templates](https://github.com/openclaw/openclaw/tree/main/.github/ISSUE_TEMPLATE)

## Questions?

If you're stuck or unsure about anything:
1. Check this guide and the [FAQ](https://docs.openclaw.ai/help/faq)
2. Search [GitHub Discussions](https://github.com/openclaw/openclaw/discussions)
3. Ask in Discord #setup-help or #contributions

We're here to help! Don't hesitate to ask questions. 🦞
