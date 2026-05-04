# Facebook Bot Setup

This repository includes a Facebook Marketplace bot implementation:

- CLI: `scripts/fb-marketplace-bot.mjs`
- Desktop UI: `desktop/` (Electron)
- Daily automation workflow: `.github/workflows/marketplace-daily.yml`

## GitHub Setup Checklist

1. Push this branch to GitHub.
2. In **Settings → Secrets and variables → Actions**, add:
   - `FB_STORAGE_STATE_B64`
   - `VERCEL_TOKEN`
3. In **Actions**, run:
   - `Marketplace Daily Runner`
   - `Deploy to Vercel`

## Recommended Repository Topic

Add the repository topic: `facebook-bot`

## Optional Repository Rename

If desired, rename the repo to: `facebook-bot`.

## One-Command Publish

Use the helper script:

```bash
GITHUB_OWNER=<your-user-or-org> GITHUB_REPO=facebook-bot ./scripts/publish-facebook-bot.sh
```

This will create (or reuse) the repo, push the current branch, and add the `facebook-bot` topic.
