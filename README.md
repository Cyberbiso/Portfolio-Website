# Thabiso Seleke AI Portfolio

Multi-page Next.js portfolio with a grounded AI assistant that answers only from Thabiso's CV and curated site facts.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Google AI (Gemini) API (`gemini-2.5-flash` by default)
- Supabase Postgres (chat logs + rate limiting)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Add values in `.env`:

- `GOOGLE_AI_API_KEY`
- `GOOGLE_AI_MODEL` (default `gemini-2.5-flash`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `RATE_LIMIT_PER_MINUTE` (default `10`)
- `RATE_LIMIT_SALT`

4. Run database schema in Supabase SQL editor:

- `supabase/schema.sql`

5. Start development server:

```bash
npm run dev
```

## CV Update Workflow

Canonical CV file:

- `content/cv/master.docx` or `content/cv/master.pdf`

Generate knowledge JSON and public download:

```bash
npm run cv:ingest
```

Sync directly from Downloads and ingest:

```bash
npm run cv:sync -- "/Users/thabisoseleke/Downloads/THABISO NATHANIEL SELEKE.pdf"
```

`npm run build` automatically triggers ingestion (`prebuild`).

## Test Commands

```bash
npm run test
npm run test:e2e
npm run typecheck
```

## Deploy to Vercel

1. Import repo into Vercel.
2. Set all env vars from `.env.example`.
3. Deploy preview and verify:
   - `/`, `/about`, `/portfolio`, and `/agent` render correctly
   - `POST /api/chat` returns grounded responses
   - chat logs appear in `chat_logs`
   - rate limiting works after burst requests
