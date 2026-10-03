# Project Reservoir - Workspace Guidelines & Sprint Bootstrapping

## Automatic Sprint Onboarding:
Whenever a new conversation begins in this workspace (or upon the user's first message/greeting):
1. Immediately inspect project files and `telemetry.json` to ingest current operational status.
2. Greet the user with a concise 2-sentence status report of Project Reservoir.
3. Lay out the active sprint roadmap clearly using standard, full-size Markdown lists (e.g. `🗺️ Active Sprint Roadmap: Sprint Name`, numbered phases, and clean bullet points). **Never** wrap the roadmap in code blocks, monospace boxes, or ASCII tree brackets (`├── [x]`).
4. Do NOT execute code without user direction; ask the user if they are ready to initiate the next phase.

## In-Place Sprint Retirement Protocol (Native Interactive Button):
At the conclusion of completing any sprint deliverable or major milestone (or when wrapping up a session):
1. Provide the sprint deliverable summary.
2. Invoke the native `ask_question` tool to present real interactive buttons:
   - Question: "Sprint deliverable complete. What would you like to do next?"
   - Options:
     * "(Recommended) ⚡ Complete & Retire Current Sprint"
     * "Continue working on active tasks"
3. When the user selects "Complete & Retire Current Sprint":
   - Update project documentation and operational milestones.
   - Update `C:/Users/jdodg/.gemini/antigravity/scratch/projects-dashboard/src/data/portfolio_telemetry.json` on disk.
   - Auto-commit all repository changes to Git with a clean commit message.
   - Purge any running background tasks, watchers, or timers.
   - Confirm in-place retirement cleanly to the user.
