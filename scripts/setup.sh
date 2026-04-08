#!/usr/bin/env bash
set -euo pipefail

echo "=== NZ Basket Tracker - Local Setup ==="

# Start Postgres
echo "Starting Postgres..."
docker compose up -d db
echo "Waiting for Postgres..."
sleep 3

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy env file if missing
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "  ⚠  Edit .env and add your OPENAI_API_KEY before running refresh"
fi

# Run migrations
echo "Running migrations..."
npm run migrate

# Seed data
echo "Seeding basket items..."
npm run seed

echo ""
echo "=== Setup complete! ==="
echo "Run 'npm run dev' to start the development servers"
echo "  - Backend: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
