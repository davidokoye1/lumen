# Lumen: read faster, understand more

Lumen is a full-stack speed-reading learning app. It trains attention, word recognition and phrase reading, and it always measures progress as **effective reading rate** (WPM × comprehension), so users can't "improve" by skimming and understanding less.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

The SQLite database is created automatically at `./data/lumen.db` on first request. Override the location with `DATABASE_PATH`.

Optional demo account with 8 weeks of simulated history, useful for exploring the dashboard and analytics:

```bash
npm run db:seed-demo   # demo@lumen.local / demo-reader-1
```

Production:

```bash
npm run build && npm start
```

Other scripts: `npm run typecheck`, `npm run db:reset` (deletes the local database file).

Requires **Node 22.13 or newer** (it uses the built-in `node:sqlite` module, so nothing needs compiling, and Python and Visual Studio aren't needed). Node may print an `ExperimentalWarning` about SQLite on startup, which is harmless.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind CSS v4, CSS-variable design tokens, light + dark themes |
| Data | SQLite via Node's built-in `node:sqlite` (no native packages to compile), WAL mode, versioned migrations in `src/lib/db/migrations.ts` |
| Auth | Email + password (bcrypt, cost 12), opaque session tokens stored as SHA-256 hashes, httpOnly SameSite cookies |
| Validation | Zod on every action input, server-side |
| Charts | Hand-built SVG components (crosshair tooltips, keyboard access, table view for every chart) |
| Fonts | Inter (UI), Literata (reading), Atkinson Hyperlegible (accessibility option), all self-hosted |

## Project layout

```
src/
  app/
    (auth)/          login, signup
    (app)/           dashboard, learn, train, library, analytics, achievements, settings (with app shell)
    (focus)/         distraction-free players: /train/[exercise], /learn/[lessonId], /check-in
    onboarding/      goals → placement read → level
    api/account/export
  actions/           server actions (auth, practice, lessons, library, onboarding, settings)
  components/
    training/        RSVP, pacer, timed reader, quiz, drills (span, grid, chunks, scan), results
    lesson/          lesson player and concept cards
    charts/          line, bar, scatter, heatmap, sparkline, meter list
    analytics/ dashboard/ library/ settings/ shell/ ui/
  lib/
    content/         original library (18 articles), 5 standardized check-in passages, word bank
    curriculum/      the 25-session Lumen Method and unlock and progress logic
    reading/         tokenizer, focal-letter (ORP) calculation, timing, phrase segmentation
    stats/           overview, analytics, reports, personal records
    gamification/    levels, achievements, weekly challenges
    services/        reward settlement pipeline, dashboard and shell loaders
    dal/             data access (users, sessions, lessons, library, XP, notifications)
    auth/            sessions, password hashing, rate limiting
  proxy.ts           optimistic auth gate (Next 16's replacement for middleware)
```

## The curriculum (the Lumen Method)

25 sessions in three stages: **Foundations → Fluency → Mastery**. Each session teaches one technique, trains it, then checks that it carries over to real reading with comprehension questions. The design principles:

1. **Comprehension gates speed.** Effective rate is the headline number. Below 70% comprehension, recommendations slow you down.
2. **Train, then transfer.** Drills alone transfer only partly, so every drill is followed by real reading.
3. **Small, honest steps.** Paced practice sits 10–25% above your measured comfortable speed, not 3×.
4. **Purpose sets pace.** Strategic skills are taught explicitly: previewing, the four reading gears, skimming, scanning, questions-first reading and retrieval practice.
5. **No myths.** Subvocalization is treated as normal, and the limits of peripheral vision are stated plainly. Concept cards cite the research behind each technique.

Stage checkpoints and the weekly check-in use standardized passages of similar length and difficulty, so progress is comparable over time.

## Measurement integrity

- Timed reading pauses its clock while the tab is hidden.
- RSVP and pacer only count time spent actually playing. Punctuation pauses are normalized, so the reported WPM is exact.
- Self-paced reads faster than 1,100 WPM are saved but flagged and left out of speed stats. Skims are logged separately.
- Comprehension only counts when at least 80% of the text was read, and answers are graded on the server. The answer key never reaches the browser.
- XP is computed on the server from validated metrics.

## Security notes

- Passwords: bcrypt with a timing-equalized check for unknown emails.
- Sessions: 32-byte random tokens; only their SHA-256 hash is stored. 30-day sliding expiry. Changing the password signs out other devices.
- Rate limits: login (8 per email and 30 per IP per 15 minutes), signup, password change and account deletion. The limiter is in-memory, so move it to Redis if you run multiple instances.
- Server Actions get Next's built-in origin check (CSRF). Security headers are set in `next.config.ts`.
- Every query is scoped to the signed-in user. Data export never includes credentials. Account deletion cascades through every table.

## Notifications

In-app notifications cover badges, level-ups, weekly challenges, an evening streak-risk nudge and the Monday weekly report, each with its own toggle. The optional daily reminder uses the browser Notification API and fires while Lumen is open in a tab. Email and push delivery would need a mail provider or a service worker; they aren't included.
