# Handoff Package v2 — 8-Week Plan with W4/W6/W8 Releases

This is the complete planning + prompt package for the 8-week ministry frontend rebuild. Drop these files into your project and Claude Code in VS Code will have everything it needs.

## What's inside

| File | Goes where | Purpose |
|------|-----------|---------|
| `CLAUDE.md` | Repo root (`~/moeys/CLAUDE.md`) | Auto-loaded by Claude Code every session |
| `00_MASTER_PLAN.md` | `~/moeys/final/_rebuild/` | What we're building, scope, scenarios |
| `01_PROMPTS.md` | `~/moeys/final/_rebuild/` | All execution prompts in order |
| `02_DECISIONS.md` | `~/moeys/final/_rebuild/` | Decisions log |
| `03_TIMELINE.md` | `~/moeys/final/_rebuild/` | 8-week schedule |
| `04_RELEASES.md` | `~/moeys/final/_rebuild/` | W4/W6/W8 release scopes |
| `RED_LINES.md` | `~/moeys/final/_rebuild/` | Hard rules Claude Code must never violate |
| `SECURITY_CHECKLIST.md` | `~/moeys/final/_rebuild/` | Per-module self-audit |
| `README.md` | (this file, your reference) | How to use the package |

## Install (5 minutes)

```bash
# 1. Move to your project
cd ~/moeys

# 2. Make sure git is clean and you're on the rebuild branch
git status
git checkout rebuild   # or: git checkout -b rebuild  if not yet created

# 3. Create the rebuild folder if not already there
mkdir -p final/_rebuild

# 4. Copy the handoff files into place (adjust the source path to where you downloaded them)
cp ~/Downloads/handoff_v2/CLAUDE.md              ./CLAUDE.md
cp ~/Downloads/handoff_v2/00_MASTER_PLAN.md      ./final/_rebuild/00_MASTER_PLAN.md
cp ~/Downloads/handoff_v2/01_PROMPTS.md          ./final/_rebuild/01_PROMPTS.md
cp ~/Downloads/handoff_v2/02_DECISIONS.md        ./final/_rebuild/02_DECISIONS.md
cp ~/Downloads/handoff_v2/03_TIMELINE.md         ./final/_rebuild/03_TIMELINE.md
cp ~/Downloads/handoff_v2/04_RELEASES.md         ./final/_rebuild/04_RELEASES.md
cp ~/Downloads/handoff_v2/RED_LINES.md           ./final/_rebuild/RED_LINES.md
cp ~/Downloads/handoff_v2/SECURITY_CHECKLIST.md  ./final/_rebuild/SECURITY_CHECKLIST.md

# 5. Commit the package
git add CLAUDE.md final/_rebuild/
git commit -m "chore: install 8-week rebuild handoff package v2"

# 6. Open in VS Code
code .
```

## Bootstrap Claude Code (first message of new session)

Open Claude Code panel in VS Code and paste this **first message** verbatim:

```
I'm continuing a project rebuild. Please bootstrap by reading these files in order:

1. CLAUDE.md (repo root) — your operating manual
2. final/_rebuild/00_MASTER_PLAN.md — what we're building
3. final/_rebuild/02_DECISIONS.md — decisions made
4. final/_rebuild/03_TIMELINE.md — 8-week schedule
5. final/_rebuild/04_RELEASES.md — release scopes
6. final/_rebuild/RED_LINES.md — hard rules
7. final/_rebuild/SECURITY_CHECKLIST.md — per-module audit
8. final/_rebuild/01_PROMPTS.md — the prompt playbook

After reading, please:
- Summarize the project in 5 bullet points
- Tell me which week we should be on (check git log + 03_TIMELINE.md)
- Tell me which prompt is next from 01_PROMPTS.md
- Tell me what you need from me to start

Do not modify any files yet.
```

Once it confirms understanding, paste the next prompt from `01_PROMPTS.md` (likely Prompt 1 if you haven't started, or the next module-rebuild prompt if you have).

## Daily evening rhythm (recommended)

Each evening:
1. **6pm–6:30pm:** Run the **Evening Kickoff prompt** from `01_PROMPTS.md`. Claude Code will summarize state and propose the next prompt.
2. **6:30pm–9pm:** Paste the next prompt. Watch it execute. Review diffs. Walk through scenarios manually.
3. **9pm–10pm:** Verify build is clean, commit, update CLAUDE.md if a new pattern emerged.

**Hard rule for vibe-coding mode:** ask Claude Code at the end of every evening:
> "In plain language, walk me through what a user does in this module from login to finishing their task. Then walk me through what could go wrong, and how the code handles each failure."

If the answer is fuzzy, you've found bugs. Don't commit until the answer is crisp.

## Weekly rhythm

- **Mon–Thu:** one module-rebuild prompt per evening (Prompt 6 with the next module name)
- **Fri:** Smoke test prompt (Prompt 7) + fix top 1–2 issues
- **Sat morning:** Light cleanup, plan next week
- **Sun evening:** Weekly review prompt (Prompt 8) — catches drift, audits past week's commits

## When to use Claude.ai chat (not Claude Code)

Come back to Claude.ai chat for:
- Reviewing audit / smoke / weekly review outputs and deciding what to prioritize
- "Should I do X or Y?" decisions
- Mid-rebuild architecture decisions

Stay in Claude Code for:
- All actual file changes
- Module rebuilds (Prompt 6 × 13)
- Debugging specific files

## Key milestones at a glance

| Week | Focus | Modules | Release |
|------|-------|---------|---------|
| 1 | Foundation | (setup) | — |
| 2 | Identity + ref data | auth, common, dashboard, users | — |
| 3 | Event lifecycle | events, sports, organizations | — |
| 4 | Survey engine | survey, submissions | **W4 Beta** |
| 5 | Registration | registration-flow, participation start | — |
| 6 | Reports v1 | reports (4 of 8) | **W6 Pilot** |
| 7 | Reports v2 + feedback | remaining 4 reports, team mode, flag/review | — |
| 8 | Polish + production | cards, hardening | **W8 Production v1.0** |

## When something goes wrong

Every prompt commits. To roll back any prompt:
```bash
git reset --hard HEAD~1
```

To start the week over (preserving _rebuild/ and _contract/):
```bash
git log --oneline -20    # find the commit hash from end of previous week
git reset --hard <hash>
```

To start over completely:
```bash
git checkout main
git branch -D rebuild
git checkout -b rebuild
# then re-run the install steps
```

## What this package gives you that the v1 didn't

- **3 release milestones** with frozen scope (W4 / W6 / W8)
- **Built-in feedback time** in W5 and W7 (after each release)
- **RED_LINES.md** — Claude Code reads on every session, prevents catastrophic bugs
- **SECURITY_CHECKLIST.md** — forces self-audit before commit
- **Weekly review prompt** — catches accumulated drift on Sundays
- **Evening kickoff prompt** — primes Claude Code to the right rhythm
- **Release deploy prompts** for W4, W6, W8 — explicit deploy checklists

## One last reminder

Don't run Claude Code 8 hours/day if you can only review 1–2 hours/night. Run it **only when you're at the keyboard reviewing live**. Code accumulates faster than reviews when you separate the two — and un-reviewed code in a ministry production system is the start of every disaster story.

Good luck. Come back to Claude.ai when you've run a few prompts and want to review the outputs together.
