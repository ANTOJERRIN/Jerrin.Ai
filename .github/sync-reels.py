"""Publish the latest CodeWithJeru reels using the Instagram Login API."""

import json
import os
import re
from pathlib import Path
from urllib.error import URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen


def main():
    token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    user_id = os.environ.get("INSTAGRAM_USER_ID", "")
    if not token or not user_id.isdecimal():
        print("Reel sync is waiting for INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID.")
        return

    query = urlencode({
        "fields": "caption,permalink,media_url,timestamp,username",
        "limit": 50,
    })
    request = Request(
        f"https://graph.instagram.com/v27.0/{user_id}/media?{query}",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        with urlopen(request, timeout=20) as response:
            posts = json.load(response)["data"]
    except (URLError, ValueError, KeyError) as error:
        raise SystemExit(f"Instagram media request failed ({type(error).__name__}).") from None

    if any(post.get("username", "").lower() != "codewithjeru" for post in posts):
        raise SystemExit("Instagram account could not be verified as @codewithjeru.")

    reels = []
    for post in sorted(posts, key=lambda post: post.get("timestamp", ""), reverse=True):
        permalink = urlsplit(post.get("permalink", ""))
        if permalink.hostname not in {"instagram.com", "www.instagram.com"}:
            continue
        if not re.fullmatch(r"/reels?/[\w-]+/?", permalink.path):
            continue
        reels.append({
            "permalink": f"https://www.instagram.com{permalink.path}",
            "caption": post.get("caption", "")[:140],
            "media": post.get("media_url", ""),
        })
        if len(reels) == 8:
            break

    Path("reels.json").write_text(
        json.dumps({"reels": reels}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
