#!/usr/bin/env python3
"""
install_skills_sh.py
A Python utility to discover and install all skills listed on https://skills.sh/

Features:
- Fetches all skills from skills.sh sitemaps (over 20,000+ skills indexed).
- Defaults to GLOBAL installation (~/.agents/skills and syncs to ~/.gemini/config/skills).
- Skips already installed skills automatically to save time and bandwidth.
- Supports search filtering (--search / -s), owner filtering (--owner), and batching.
- Multi-threaded concurrent installation.
- Dry-run mode to inspect skills before downloading.
"""

import sys
import os
import re
import json
import argparse
import subprocess
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
SITEMAP_URLS = [
    "https://www.skills.sh/sitemap-skills-1.xml",
    "https://www.skills.sh/sitemap-skills-2.xml",
]

GLOBAL_AGENTS_SKILLS = os.path.expanduser("~/.agents/skills")
GLOBAL_GEMINI_SKILLS = os.path.expanduser("~/.gemini/config/skills")
CACHE_FILE = os.path.expanduser("~/.skills_sh_cache.json")


def fetch_url(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[-] Warning: Failed to fetch {url}: {e}", file=sys.stderr)
        return ""


def get_already_installed_skills():
    installed = set()
    for d in [GLOBAL_AGENTS_SKILLS, GLOBAL_GEMINI_SKILLS]:
        if os.path.isdir(d):
            for item in os.listdir(d):
                if os.path.isdir(os.path.join(d, item)):
                    installed.add(item.lower())
    return installed


def fetch_all_skills():
    """Fetch complete list of skills from skills.sh sitemaps."""
    print("[*] Fetching skills index from skills.sh sitemaps...")
    all_specs = []
    seen = set()

    for sitemap_url in SITEMAP_URLS:
        print(f"  [+] Downloading {sitemap_url}...")
        data = fetch_url(sitemap_url, timeout=30)
        if not data:
            continue
        
        locs = re.findall(r"<loc>(.*?)</loc>", data)
        print(f"  [✓] Parsed {len(locs)} URLs from {os.path.basename(sitemap_url)}")
        
        for loc in locs:
            # Format: https://www.skills.sh/{owner}/{repo}/{skill_name}
            match = re.match(r"https?://(?:www\.)?skills\.sh/([^/]+)/([^/]+)/([^/]+)", loc)
            if match:
                owner, repo, skill = match.groups()
                spec = f"{owner}/{repo}@{skill}"
                if spec not in seen:
                    seen.add(spec)
                    all_specs.append({
                        "spec": spec,
                        "owner": owner,
                        "repo": repo,
                        "skill": skill,
                        "url": loc
                    })

    print(f"[✓] Total unique skills in catalog: {len(all_specs)}")
    return all_specs


def sync_to_gemini_config():
    """Ensure all skills in ~/.agents/skills are also linked to ~/.gemini/config/skills."""
    os.makedirs(GLOBAL_GEMINI_SKILLS, exist_ok=True)
    synced = 0
    if os.path.isdir(GLOBAL_AGENTS_SKILLS):
        for name in os.listdir(GLOBAL_AGENTS_SKILLS):
            src = os.path.join(GLOBAL_AGENTS_SKILLS, name)
            dest = os.path.join(GLOBAL_GEMINI_SKILLS, name)
            if os.path.isdir(src) and not os.path.exists(dest):
                try:
                    os.symlink(src, dest)
                    synced += 1
                except Exception:
                    pass
    return synced


def install_skill_spec(spec_info, is_global=True):
    spec = spec_info["spec"]
    skill_name = spec_info["skill"]

    cmd = ["npx", "-y", "skills", "add", spec, "-y"]
    if is_global:
        cmd.append("-g")

    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=120
        )
        if proc.returncode == 0:
            return (spec, True, f"Installed '{skill_name}' successfully")
        else:
            last_line = proc.stdout.strip().split("\n")[-1] if proc.stdout else "Unknown error"
            return (spec, False, last_line)
    except subprocess.TimeoutExpired:
        return (spec, False, "Timed out after 120s")
    except Exception as e:
        return (spec, False, str(e))


def main():
    parser = argparse.ArgumentParser(
        description="Scrape and install all skills from https://skills.sh/",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check total available skills (dry run):
  python3 install_skills_sh.py --dry-run

  # Search for react/frontend design skills and install globally:
  python3 install_skills_sh.py --search design --limit 20

  # Install first 50 skills globally with 4 workers:
  python3 install_skills_sh.py --limit 50 -c 4

  # Install skills by a specific owner/organization:
  python3 install_skills_sh.py --owner vercel-labs

  # Export complete list of all 20,000 skills to a JSON/TXT file:
  python3 install_skills_sh.py --export skills_catalog.json
"""
    )
    parser.add_argument("--global", "-g", dest="is_global", default=True, action="store_true",
                        help="Install globally to ~/.agents/skills (default: True)")
    parser.add_argument("--project", "-p", dest="is_global", action="store_false",
                        help="Install to local project scope instead of global")
    parser.add_argument("--search", "-s", type=str, default="",
                        help="Filter skills matching keyword in skill name or repo")
    parser.add_argument("--owner", type=str, default="",
                        help="Filter skills by owner/organization")
    parser.add_argument("--limit", "-l", type=int, default=0,
                        help="Maximum number of skills to install (0 = no limit)")
    parser.add_argument("--concurrency", "-c", type=int, default=3,
                        help="Number of concurrent download threads (default: 3)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Discover and display skills matching criteria without installing")
    parser.add_argument("--skip-existing", default=True, action="store_true",
                        help="Skip skills already present in global skills folder (default: True)")
    parser.add_argument("--export", type=str, default="",
                        help="Export fetched skill list to specified JSON or TXT file")

    args = parser.parse_args()

    # 1. Fetch catalog
    skills = fetch_all_skills()
    if not skills:
        print("[-] Error: Could not retrieve skills catalog.", file=sys.stderr)
        sys.exit(1)

    # 2. Filter
    if args.owner:
        owner_lower = args.owner.lower()
        skills = [s for s in skills if s["owner"].lower() == owner_lower]
        print(f"[*] Filtered by owner '{args.owner}': {len(skills)} skills remaining")

    if args.search:
        query = args.search.lower()
        skills = [s for s in skills if query in s["skill"].lower() or query in s["repo"].lower() or query in s["owner"].lower()]
        print(f"[*] Filtered by search '{args.search}': {len(skills)} skills remaining")

    # 3. Check already installed
    if args.skip_existing:
        installed = get_already_installed_skills()
        initial_len = len(skills)
        skills = [s for s in skills if s["skill"].lower() not in installed]
        skipped = initial_len - len(skills)
        if skipped > 0:
            print(f"[*] Skipping {skipped} already installed skills ({len(skills)} remaining)")

    # 4. Limit if requested
    if args.limit > 0:
        skills = skills[:args.limit]
        print(f"[*] Limiting to first {args.limit} skills")

    # 5. Export if requested
    if args.export:
        if args.export.endswith(".json"):
            with open(args.export, "w") as f:
                json.dump(skills, f, indent=2)
        else:
            with open(args.export, "w") as f:
                for s in skills:
                    f.write(f"{s['spec']}\t{s['url']}\n")
        print(f"[✓] Exported {len(skills)} skills to {args.export}")

    if args.dry_run:
        print(f"\n--- Discovered Skills Preview (Total: {len(skills)}) ---")
        for i, s in enumerate(skills[:50], 1):
            print(f"{i:4d}. {s['spec']:<45} ({s['url']})")
        if len(skills) > 50:
            print(f"... and {len(skills) - 50} more. Run without --dry-run to install.")
        return

    if not skills:
        print("[✓] All target skills are already installed!")
        sync_to_gemini_config()
        return

    # 6. Execute installation
    mode_str = "GLOBALLY" if args.is_global else "LOCALLY"
    print(f"\n[*] Starting installation of {len(skills)} skills {mode_str} with concurrency={args.concurrency}...")
    
    success_count = 0
    fail_count = 0

    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = {executor.submit(install_skill_spec, s, args.is_global): s for s in skills}
        for future in as_completed(futures):
            spec, ok, msg = future.result()
            if ok:
                success_count += 1
                print(f"  [✓] ({success_count + fail_count}/{len(skills)}) {spec}: {msg}")
            else:
                fail_count += 1
                print(f"  [✗] ({success_count + fail_count}/{len(skills)}) {spec}: {msg}")

    # 7. Sync to ~/.gemini/config/skills
    if args.is_global:
        synced = sync_to_gemini_config()
        print(f"\n[✓] Synced {synced} new global skills to Antigravity global root (~/.gemini/config/skills)")

    print(f"\n{'='*50}")
    print(f"[✓] Completed! Installed: {success_count} | Failed: {fail_count}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
