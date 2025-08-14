# Development server
dev:
    pnpm dev

# Build for production
build:
    pnpm build

# Start production server
start:
    pnpm start

# Run linter
lint:
    pnpm lint

# Data management scripts
migrate:
    pnpm migrate

migrate-files:
    pnpm migrate:files

migrate-lyrics:
    pnpm migrate:lyrics

enrich-songs:
    pnpm enrich:songs

report-songs:
    pnpm report:songs

add-slugs:
    pnpm add:slugs