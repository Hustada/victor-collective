# The Victor Collective

Public site + operator portal for The Victor Collective. Next.js App Router frontend (Vercel) and a separate Express/SQLite API (`server/`, Railway).

## What's here

- **Public site** — landing, blog (markdown in `src/content/blog/`), privacy. Obsidian Ember design system (MUI + Framer Motion).
- **Portal** (`/portal`, password-gated, server-side sessions) — invoices (PDF + email via Resend), client registry, and the AI inbox.
- **AI inbox** (`/inbox`) — IMAP mailbox with intent triage (Haiku classifies reply/money/waiting/noise, batched 15/call), one-line AI summaries, draft-ahead replies in the operator's voice (Opus, grounded in real Sent-folder examples), and a synthesized briefing line. All verdicts cached in SQLite by Message-ID and prompt version — the model is only called for new mail or a changed prompt.

## Development

```bash
npm install && (cd server && npm install)
npm run dev:all        # web :3000 + api :3001
```

Server tests (vitest): `cd server && npm run test:run`
Web checks: `npm run check` (prettier + eslint + tsc) · `npm run build`
Classifier eval: `cd server && npm run eval:run` (scores the live classifier against the hand-labeled set in `server/eval/eval-set.json` — local-only, gitignored, do not lose it)

CI runs server tests and web lint+build on every PR.

## Environment

Web (`.env` / Vercel): `API_URL` — Railway API base for the Next rewrite proxy (defaults to `http://localhost:3001`).

Server (`server/.env` / Railway):

| Var | Purpose |
| --- | --- |
| `PORTAL_PASSWORD` | Portal login (auth fails closed if unset) |
| `ANTHROPIC_API_KEY` | Classifier, summaries, drafts, briefing |
| `IMAP_HOST` / `IMAP_PORT` / `IMAP_USER` / `IMAP_PASS` | Mailbox |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Outbound email |
| `INVOICE_DB_PATH` | SQLite location — **point at a persistent volume on Railway**, the default `server/data/` is ephemeral |
| `NODE_ENV=production` | Secure cookies |

## Deploy notes

- SQLite holds invoices, sessions, and all AI caches. Railway needs a persistent volume mounted and `INVOICE_DB_PATH` pointed at it, or every redeploy wipes the data.
- The portal API is cookie-authenticated and same-origin via the Next rewrite proxy; direct hits on the Railway URL get 401.

## Backups

`GET /api/backup` (authed) streams a consistent snapshot of the whole database — invoices, subscribers, and the draft-edit voice dataset. Pull one off-box on a schedule:

```bash
TOKEN=$(curl -s -X POST https://www.victorcollective.com/api/auth/login \
  -H 'content-type: application/json' -d '{"password":"<portal password>"}' \
  -c - | awk '/portal_session/ {print $7}')
curl -s -b "portal_session=$TOKEN" -o "vc-$(date +%F).db" https://www.victorcollective.com/api/backup
```

Drop that in a local cron/launchd job; keep `server/eval/eval-set.json` (the hand-labeled classifier baseline) backed up alongside — it exists only on the operator's machine.

## License

MIT
