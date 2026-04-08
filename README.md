# NZ Basket Tracker

Monthly NZ grocery purchasing-power tracker using a fixed basket of 12 grocery items. Tracks prices across major retailers (Woolworths, Pak'nSave) via automated scraping, LLM-powered review, and median-price normalisation to produce a single monthly "basket cost" figure.

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- Docker (for Postgres)

### Setup

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
npm run dev
```

### Manual Setup

1. Start Postgres: `docker compose up -d db`
2. Install deps: `npm install`
3. Copy env: `cp .env.example .env` (edit with your OpenAI key)
4. Run migrations: `npm run migrate`
5. Seed data: `npm run seed`
6. Start dev: `npm run dev`

Backend runs at http://localhost:3000, frontend at http://localhost:5173.

## Running the Refresh Job

```bash
# Manual refresh (fetches prices + LLM review + compute normalised prices)
npm run refresh

# Generate monthly snapshot
npm run snapshot
# Or for a specific month:
npm run snapshot -- 2026-04
```

## Testing

```bash
npm test
```

## Production Deployment (Railway)

### Services Required

1. **Web Service** — runs the app (Dockerfile)
2. **Cron Service** — runs weekly refresh
3. **PostgreSQL** — Railway managed Postgres

### Setup Steps

1. Create a Railway project
2. Add a PostgreSQL service (managed)
3. Add a Web Service from your repo
   - Builder: Dockerfile
   - Set environment variables (see `.env.example`)
   - `DATABASE_URL` is auto-set by Railway when you link Postgres
4. Add a Cron Service for weekly refresh
   - Command: `node server/dist/jobs/weekly-refresh.js`
   - Schedule: `0 6 * * 1` (Monday 6am NZT)
5. Run initial migration: `npm run migrate` (via Railway CLI or deploy command)
6. Run seed: `npm run seed`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key for price review |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (default: development) |
| `ENABLED_RETAILERS` | No | Comma-separated retailer keys |
| `BASELINE_MONTH` | No | Baseline month YYYY-MM (default: 2026-04) |

## Architecture

```
shared/              Shared TypeScript types and utility functions
server/              Express API + services + jobs
  src/
    adapters/        External integrations (OpenAI, retailers)
    controllers/     Request handlers
    db/              Database pool, migrations, seeds
    jobs/            Standalone job scripts (refresh, snapshot)
    middleware/      Express middleware (errors, validation, static files)
    repositories/    Data access layer
    routes/          Express route definitions
    services/        Business logic
    tests/           Unit tests (vitest)
client/              Vue 3 SPA
  src/
    api/             Typed API client
    components/      UI components
    composables/     Vue composables
    router/          Vue Router config
    stores/          Pinia stores
    styles/          Global styles
    views/           Page views
```

## Data Flow

1. Weekly refresh job runs retailer adapters to scrape current prices
2. Raw price observations are stored in the database
3. OpenAI reviews each observation (accept/reject with reasoning)
4. Median of accepted observations becomes the canonical weekly price
5. Monthly snapshot captures prices x quantities = basket cost
6. Dashboard shows cost trends over time

## Tech Stack

- **Frontend**: Vue 3, Vite, Pinia, Vue Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **LLM**: OpenAI (GPT-4o-mini for price classification)
- **Deployment**: Railway (Dockerfile-based)
