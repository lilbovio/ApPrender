# ApPrender — START HERE (Claude Code)

All documentation read by Claude is in English. Product copy remains in Spanish.

## 1. Setup (PowerShell, from the repository root)

```powershell
cd C:\Users\bovio\Documents\proyectos\ApPrender
claude update
claude --version
claude
```

`claude update` is required before using Opus 5.5 / Sonnet 5.5 / Haiku 5.5. If an alias does not resolve to 5.5, use the full IDs `claude-opus-5-5`, `claude-sonnet-5-5`, and `claude-haiku-5-5`.

## 2. Prompt 1 — kickoff and plan (paste this first)

```text
You are the lead architect for the ApPrender UI/UX redesign. Work from the repository root. First read CLAUDE.md, DESIGN.md, START_HERE.md, design-review.html, and client/src/App.jsx. Then use the figma-reader-haiku agent with the Figma MCP to reconcile the master file (tF4Sk7ECGqnN0H506lJY4x) against DESIGN.md. DESIGN.md wins on every conflict: do not resurrect legacy tokens, 16/24/32 radii, or the old motion values.

Scope: client/ only. Do not touch server/, the database, models, API contracts, or existing routes in client/src/App.jsx except adding the landing at `/`. The only permitted logic change is the VAK bank: 6 -> 12 questions, dominant + secondary scoring, and a UI guard that sends users without a VAK profile to the survey. Internal answers are { questionId, optionId }; the server contract is unchanged: PUT /api/vak accepts only { vakType: 'visual' | 'auditivo' | 'kinestesico' } and User stores only vakType. Send the dominant modality only; keep the secondary modality in namespaced localStorage for this browser. Reuse AuthContext.saveVAKType instead of duplicating the API call. Do not touch server/, models, or the database.

Before writing code, reply with a short phased implementation plan and the exact files you will create or modify. Do not implement until I reply "GO PHASE 1". Use builder-haiku for implementation tasks and reviewer-sonnet after each task; the reviewer must answer APPROVED or a file/line issue list.

Follow the approved journey: Landing -> Auth (register/login) -> VAK survey (12 questions for new users or login without profile) -> Dashboard "Tu camino de hoy" -> Subjects -> Lesson (visual/auditory/kinesthetic) -> Quiz -> Reward -> Profile -> Dashboard. Match design-review.html visually, keep all user-facing copy in Spanish, and enforce the anti-AI checklist and reduced-motion rules from DESIGN.md.

Suggested phases: (1) tokens + ui primitives + Pilo and stroke icons + landing; (2) AuthSurface; (3) VAK survey and scoring; (4) Dashboard; (5) Subjects, Lessons, Quiz, Reward, Profile; (6) motion pass, build, and final review.
```

## 3. Prompt 2 — after reviewing the plan

```text
GO PHASE 1. Implement only phase 1 from your plan, run reviewer-sonnet, then report the changed files and the verification results. Stop and wait for my approval before phase 2.
```

Repeat `GO PHASE N` for each subsequent phase. If you want Claude to run all phases without stopping, replace prompt 2 with:

```text
GO ALL PHASES. Implement the full plan in order, running reviewer-sonnet after each phase. Stop only if the reviewer rejects a phase or the build fails.
```

## 4. Rules during execution

- Keep Claude at the repository root so `CLAUDE.md` and `.claude/agents/` load automatically.
- Never paste instructions into `.claude/worktrees/`; Claude Code generates that directory.
- Do not edit Figma from Claude unless the visual spec in `DESIGN.md` has been updated first.
- Expected final checks: `npm --prefix client run build`, `git diff --check`, `git status --short`.

## 5. Visual QA setup (Playwright MCP)

Playwright is not installed in this repo. Add it to Claude Code once, then restart the Claude session so the MCP tools load:

```powershell
claude mcp add playwright npx @playwright/mcp@latest
npx playwright install chromium
```

Required services, in two terminals:

```powershell
npm --prefix server run dev
npm --prefix client run dev
```

The API needs a reachable `MONGO_URI` in `server/.env`. Do not run `seed:starter` unless the user explicitly approves writing data.

QA artifacts should go to a temp folder, not into the repo, for example `C:\Users\bovio\AppData\Local\Temp\apprender-qa\`.

## 6. Responsive phase (after the current QA task)

Do not send this while another Claude task is running. It is a separate phase.

```text
Implement DESIGN.md section 14 (Responsive layout). The current 480px cap in Screen.module.css and BottomNav.module.css makes the app look like a phone frame on desktop, which is rejected. Replace it with the breakpoint-dependent --content-max shell, keep the bottom nav below 900px, and switch to a 240px left rail at >=900px. Reflow Landing, Auth, Dashboard, Subjects, Lesson/Quiz, Reward, and Profile as specified, including the type scale. Keep one primary CTA and one Pilo per screen, and preserve reduced-motion behavior. Verify no horizontal scroll at 320, 390, 768, 1024, and 1440px, run reviewer-sonnet, then build. Do not touch server/ and do not commit.
```

## 7. Post-responsive fixes and end-to-end lesson QA

Send only after the responsive phase is approved.

```text
Fix the two QA defects from DESIGN.md section 7: (1) the dashboard must show a first-action empty state for a user with zero lessons instead of the "Ya terminaste todo" completion message; (2) sign-out must land on `/`, not `/login`, using a full navigation after clearing auth storage so the route guard cannot redirect.

The starter data has already been seeded by me. Do not run `seed:starter` again. Because the live DB now has lessons, verify the empty-state fix with a mocked zero-lesson or completed-user state, not by relying on the live dashboard.

Then run the blocked end-to-end lesson steps at 390px with reduced motion ON: one visual lesson, one auditory lesson, one kinesthetic lesson, one wrong answer with hint, the second wrong answer revealing the answer, and a real reward with exactly one POST /progress/<subject>/complete. Repeat the reward check with reduced motion OFF for confetti. Keep the existing QA user; do not delete it without asking. Do not change server/ code, do not commit, and report pass/fail per step plus final build and git diff --check results.

## 8. Dashboard richness and profile settings (after the current task)

Do not send this while the end-to-end lesson QA is running.

```text
Implement DESIGN.md section 15 (Dashboard richness and profile settings). Keep the single primary CTA on Home. Add the time-aware greeting, level chip, 7-day streak path, star progress on subject doors, a trophy shelf with up to three earned badges and a quiet link to /profile#logros, and a compact weekly-goal path only when real progress exists. Do not restore clouds, emoji, generic bars, the "ACEPTAR" mission button, dark mode, or competing CTAs.

In Profile settings, use the existing PUT /api/users/profile endpoint with { name, email, avatar, password } from server/src/controllers/userController.js. Do not restore the legacy userService endpoints. Add adult-email editing, change password with new + repeat fields and min 8 validation, and optional photo upload compressed client-side to <=256px and <=120KB as a data URL. Keep the three preset stroke avatars and the existing retake-VAK action. Do not add dead toggles and do not change server/.

Also add `.playwright-mcp/` to .gitignore and remove the `!important` on the desktop Logo by giving Logo a size prop. Run reviewer-sonnet, build, and report. Do not commit and do not delete the QA user.
```

## 9. Backlog (do not include in the current prompt)

- **Server streak quirk:** `completeLesson` increments the streak when the last activity was under 24 h ago, so three lessons in one day count as three days. It is server-side and out of scope for this redesign. Fix it in a separate backend task with tests before production.
- **QA data:** `qa1795738705416@example.com` now has 4 completed lessons through the real endpoint. Keep it until the user explicitly asks to delete it.
- **Vercel preview:** `https://ap-prender-client.vercel.app/` still shows the old app because nothing has been committed yet. Do not treat it as the current design.
- **Figma:** nodes `3:34` and `3:67` remain unverified because of the Starter MCP limit. `DESIGN.md` stays authoritative.
