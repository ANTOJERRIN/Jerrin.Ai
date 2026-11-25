# CodeWithJeru reel feed

The portfolio reads `reels.json` from this repository’s default branch. GitHub Actions updates it every two hours and supports a manual run from the Actions tab.

1. Authorize the @codewithjeru professional account in a Meta app that uses Instagram Login. Request `instagram_business_basic` and obtain the Instagram user ID and an access token.
2. Add the ID as the GitHub Actions repository variable `INSTAGRAM_USER_ID`. Add the token as the repository secret `INSTAGRAM_ACCESS_TOKEN`.
3. Run **Sync Instagram reels** on the default branch. The workflow needs permission to push its generated feed. Renew the token before it expires.

The public feed contains captions, Instagram permalinks, and eligible media URLs. Reels with no playable media URL remain available through their Instagram links. Before the first successful sync, the widget links to the Instagram profile and the hero uses its gradient background.
