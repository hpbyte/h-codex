#!/bin/bash

set -e

echo "🐳 Setting up h-codex with Docker..."

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

echo "✅ Docker is running"

echo "🏗️  Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker-compose exec postgres pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
    break
  fi
  echo "Waiting for PostgreSQL... ($i/30)"
  sleep 2
done

echo "🔄 Running database migrations..."
docker-compose exec app bun run db:migrate

echo "🎉 Setup complete!"
