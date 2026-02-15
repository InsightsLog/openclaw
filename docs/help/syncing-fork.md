# Syncing Your Fork with Upstream

This guide explains how to keep your OpenClaw fork up-to-date with the upstream repository while maintaining your custom changes.

## Overview

When you fork OpenClaw, you create your own copy of the repository. Over time, the upstream OpenClaw repository gets new features, bug fixes, and improvements. To benefit from these updates while keeping your custom changes, you need to regularly sync your fork.

## Initial Setup

### 1. Check Your Current Remotes

First, see what remotes you have configured:

```bash
cd /path/to/your/openclaw
git remote -v
```

You should see something like:

```
origin  https://github.com/YOUR-USERNAME/openclaw.git (fetch)
origin  https://github.com/YOUR-USERNAME/openclaw.git (push)
```

### 2. Add the Upstream Remote

Add the official OpenClaw repository as the "upstream" remote:

```bash
git remote add upstream https://github.com/openclaw/openclaw.git
```

Verify it was added:

```bash
git remote -v
```

Now you should see:

```
origin    https://github.com/YOUR-USERNAME/openclaw.git (fetch)
origin    https://github.com/YOUR-USERNAME/openclaw.git (push)
upstream  https://github.com/openclaw/openclaw.git (fetch)
upstream  https://github.com/openclaw/openclaw.git (push)
```

## Regular Sync Workflow

### Option 1: Merge Strategy (Recommended for Most Cases)

This approach preserves all history and is safer for complex custom changes.

#### Step 1: Fetch Upstream Changes

```bash
git fetch upstream
```

This downloads the latest changes from upstream without modifying your local branches.

#### Step 2: Switch to Your Main Branch

```bash
git checkout main
```

#### Step 3: Merge Upstream Changes

```bash
git merge upstream/main
```

If there are no conflicts, Git will automatically merge the changes. If there are conflicts, see the [Handling Conflicts](#handling-conflicts) section below.

#### Step 4: Push to Your Fork

```bash
git push origin main
```

### Option 2: Rebase Strategy (For Clean History)

Use this when you want a linear history without merge commits. **Warning:** This rewrites history and should only be used on branches you haven't shared with others.

#### Step 1: Fetch Upstream Changes

```bash
git fetch upstream
```

#### Step 2: Switch to Your Main Branch

```bash
git checkout main
```

#### Step 3: Rebase on Upstream

```bash
git rebase upstream/main
```

If there are conflicts, Git will pause and let you resolve them. See [Handling Conflicts](#handling-conflicts).

#### Step 4: Force Push to Your Fork

```bash
git push --force-with-lease origin main
```

**Important:** `--force-with-lease` is safer than `--force` because it won't overwrite changes if someone else pushed to your fork.

## Handling Conflicts

When merging or rebasing, you might encounter conflicts if you've modified the same files that changed upstream.

### Identifying Conflicts

Git will tell you which files have conflicts:

```bash
git status
```

Files with conflicts will show as "both modified" or similar.

### Resolving Conflicts

1. **Open the conflicting file** in your editor. You'll see conflict markers:

```
<<<<<<< HEAD
Your changes
=======
Upstream changes
>>>>>>> upstream/main
```

2. **Decide how to resolve** each conflict:
   - Keep your changes only
   - Keep upstream changes only
   - Combine both changes
   - Write something entirely new

3. **Remove the conflict markers** (`<<<<<<<`, `=======`, `>>>>>>>`) and save the file.

4. **Mark the conflict as resolved:**

For merge:
```bash
git add path/to/resolved-file.ts
git commit -m "Merge upstream changes and resolve conflicts"
```

For rebase:
```bash
git add path/to/resolved-file.ts
git rebase --continue
```

### Aborting if Things Go Wrong

If you get stuck or want to start over:

For merge:
```bash
git merge --abort
```

For rebase:
```bash
git rebase --abort
```

## Syncing Custom Branches

If you have custom feature branches, sync them too:

```bash
# Fetch latest upstream
git fetch upstream

# Switch to your feature branch
git checkout my-feature-branch

# Merge or rebase with upstream main
git merge upstream/main
# OR
git rebase upstream/main

# Push to your fork
git push origin my-feature-branch
```

## Best Practices

### 1. Sync Regularly

Don't wait too long between syncs. The longer you wait, the more likely you'll encounter difficult conflicts.

**Recommended frequency:**
- Daily if actively developing
- Weekly if occasionally working on your fork
- Before starting any new work

### 2. Keep Custom Changes Organized

- Use feature branches for your custom work
- Keep your `main` branch as close to upstream as possible
- Document your custom changes in a `CUSTOM_CHANGES.md` file

### 3. Test After Syncing

After merging upstream changes, always test:

```bash
# Install any new dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Test your custom features
pnpm openclaw gateway
```

### 4. Review What Changed

Before syncing, review what's new in upstream:

```bash
# See commits you'll be pulling in
git fetch upstream
git log HEAD..upstream/main --oneline

# See detailed changes
git diff HEAD..upstream/main
```

### 5. Commit Your Work First

Always commit your local changes before syncing:

```bash
git status
git add .
git commit -m "WIP: my current work"
```

This makes it easier to recover if something goes wrong.

## Common Scenarios

### Scenario 1: You Only Have Minor Customizations

**Strategy:** Merge regularly, keep changes minimal.

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Scenario 2: You Have Significant Custom Features

**Strategy:** Keep custom features in separate branches, rebase them periodically.

```bash
# Update main from upstream
git checkout main
git fetch upstream
git merge upstream/main
git push origin main

# Rebase your feature branch
git checkout my-custom-feature
git rebase main
git push --force-with-lease origin my-custom-feature
```

### Scenario 3: You Want to Contribute Back to Upstream

**Strategy:** Create a clean branch from upstream main for your contribution.

```bash
# Update from upstream
git fetch upstream

# Create a new branch from upstream main
git checkout -b feature-for-upstream upstream/main

# Make your changes
# ... edit files ...

# Commit
git add .
git commit -m "Add new feature"

# Push to your fork
git push origin feature-for-upstream
```

Then open a PR from `YOUR-USERNAME/openclaw:feature-for-upstream` to `openclaw/openclaw:main`.

See [Submitting a Pull Request](https://docs.openclaw.ai/help/submitting-a-pr) for detailed PR guidelines.

### Scenario 4: Upstream Changed Something You Modified

This requires careful conflict resolution:

1. **Review both versions:**
   ```bash
   git fetch upstream
   git diff HEAD..upstream/main path/to/file.ts
   ```

2. **Merge and resolve:**
   ```bash
   git merge upstream/main
   # Resolve conflicts manually
   git add path/to/file.ts
   git commit -m "Merge upstream changes, preserving custom modifications"
   ```

3. **Test thoroughly** - make sure your customizations still work.

## Automation

### Create a Sync Script

Save this as `sync-upstream.sh`:

```bash
#!/bin/bash
set -e

echo "🦞 Syncing fork with upstream OpenClaw..."

# Fetch upstream changes
echo "📥 Fetching upstream changes..."
git fetch upstream

# Check if we're on main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're on branch '$BRANCH', not 'main'"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes!"
    echo "Please commit or stash them first."
    exit 1
fi

# Merge upstream
echo "🔀 Merging upstream/main..."
if git merge upstream/main; then
    echo "✅ Merge successful!"
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    pnpm install
    
    # Build
    echo "🔨 Building..."
    pnpm build
    
    echo "✅ Sync complete! Run 'git push origin main' to update your fork."
else
    echo "❌ Merge conflicts detected. Please resolve them manually."
    exit 1
fi
```

Make it executable:

```bash
chmod +x sync-upstream.sh
```

Run it:

```bash
./sync-upstream.sh
```

### GitHub Actions Automation

Create `.github/workflows/sync-upstream.yml` in your fork:

```yaml
name: Sync Fork with Upstream

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Sync with upstream
        run: |
          git remote add upstream https://github.com/openclaw/openclaw.git
          git fetch upstream
          git checkout main
          git merge upstream/main --no-edit
          git push origin main

      - name: Create issue if sync fails
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Fork sync failed',
              body: 'The automatic sync with upstream openclaw/openclaw failed. Please sync manually.'
            })
```

This will automatically try to sync your fork daily. If there are conflicts, it will fail and create an issue for you to resolve manually.

## Troubleshooting

### "fatal: refusing to merge unrelated histories"

This usually means your fork and upstream have diverged significantly. Force a sync:

```bash
git fetch upstream
git checkout main
git reset --hard upstream/main
git push --force origin main
```

**Warning:** This will discard all your changes on the main branch. Save them first!

### "Your branch and 'origin/main' have diverged"

This happens after rebasing. Use force push:

```bash
git push --force-with-lease origin main
```

### Upstream Changed Dependencies

If upstream updated `package.json` or `pnpm-lock.yaml`:

```bash
# After merging
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lockfile after upstream sync"
```

### Want to Undo a Sync

If you just merged and want to undo it:

```bash
git reset --hard HEAD~1
```

If you already pushed:

```bash
git reset --hard HEAD~1
git push --force-with-lease origin main
```

## Advanced: Cherry-Picking Specific Updates

If you don't want all upstream changes, you can cherry-pick specific commits:

```bash
# Fetch upstream
git fetch upstream

# Find the commit you want
git log upstream/main --oneline

# Cherry-pick it
git cherry-pick <commit-hash>

# Push
git push origin main
```

## Resources

### Documentation
- [Contributing Guide](https://docs.openclaw.ai/help/submitting-a-pr)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Fork Sync Guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)

### Getting Help
- [Discord](https://discord.gg/clawd) - #setup-help channel
- [GitHub Discussions](https://github.com/openclaw/openclaw/discussions)
- [GitHub Issues](https://github.com/openclaw/openclaw/issues)

## Summary

**Quick reference for regular syncing:**

```bash
# 1. Fetch upstream
git fetch upstream

# 2. Merge into your main branch
git checkout main
git merge upstream/main

# 3. Push to your fork
git push origin main

# 4. Test
pnpm install && pnpm build && pnpm test
```

Keep your fork healthy by syncing regularly, testing after each sync, and keeping custom changes organized! 🦞
