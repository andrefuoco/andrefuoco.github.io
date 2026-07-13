#!/usr/bin/env python3
"""Fetch ANDREFUOCO's releases from the Spotify Web API and write data/releases.json.

Runs in the scheduled GitHub Action (.github/workflows/update-releases.yml).
Requires two environment variables from a Spotify developer app
(https://developer.spotify.com/dashboard):

    SPOTIFY_CLIENT_ID
    SPOTIFY_CLIENT_SECRET

Can also be run locally:  python scripts/update_releases.py
Exits 0 with "unchanged" when the discography hasn't changed, so the
workflow only commits when there is something new.
"""

import base64
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ARTIST_ID = "1fBENlGR3erYzoPzqxH00x"
ARTIST_NAME = "ANDREFUOCO"
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "releases.json"


def get_token(client_id: str, client_secret: str) -> str:
    """Client-credentials flow: enough for public catalog data."""
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    request = urllib.request.Request(
        "https://accounts.spotify.com/api/token",
        data=urllib.parse.urlencode({"grant_type": "client_credentials"}).encode(),
        headers={"Authorization": f"Basic {credentials}"},
    )
    with urllib.request.urlopen(request) as response:
        return json.load(response)["access_token"]


def fetch_albums(token: str) -> list[dict]:
    """All albums and singles, following pagination."""
    items = []
    url = (
        f"https://api.spotify.com/v1/artists/{ARTIST_ID}/albums?"
        + urllib.parse.urlencode({"include_groups": "album,single", "market": "IT", "limit": 50})
    )
    while url:
        request = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(request) as response:
            page = json.load(response)
        items.extend(page["items"])
        url = page.get("next")
    return items


def sort_date(release_date: str) -> str:
    """Spotify dates can be YYYY, YYYY-MM or YYYY-MM-DD; normalize for sorting."""
    return (release_date + "-01-01")[:10]


def to_release(album: dict) -> dict:
    return {
        "id": album["id"],
        "name": album["name"],
        "type": album["album_type"],
        "releaseDate": album["release_date"],
        "totalTracks": album["total_tracks"],
        "artists": ", ".join(artist["name"] for artist in album["artists"]),
        "url": album["external_urls"]["spotify"],
        "embedUrl": f"https://open.spotify.com/embed/album/{album['id']}",
        "image": album["images"][0]["url"] if album["images"] else None,
    }


def main() -> int:
    client_id = os.environ.get("SPOTIFY_CLIENT_ID")
    client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
    if not client_id or not client_secret:
        print("Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET", file=sys.stderr)
        return 1

    token = get_token(client_id, client_secret)
    albums = fetch_albums(token)

    # Spotify may list the same release more than once (market variants):
    # keep the first occurrence of each title.
    seen = set()
    releases = []
    for album in albums:
        key = album["name"].strip().lower()
        if key in seen:
            continue
        seen.add(key)
        releases.append(to_release(album))
    releases.sort(key=lambda r: sort_date(r["releaseDate"]), reverse=True)

    # Only rewrite the file when the discography actually changed, so the
    # scheduled workflow doesn't create a commit every day.
    if OUTPUT.exists():
        previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        if previous.get("releases") == releases:
            print(f"unchanged ({len(releases)} releases)")
            return 0

    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "artistId": ARTIST_ID,
        "artistName": ARTIST_NAME,
        "releases": releases,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"updated ({len(releases)} releases)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
