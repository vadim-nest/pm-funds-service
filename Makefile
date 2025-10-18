.PHONY: dev build start lint format db-up db-down db-migrate db-seed db-studio test test-watch

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

format:
	npm run format

db-up:
	npm run db:up

db-down:
	npm run db:down

db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

db-studio:
	npm run db:studio

test:
	npm run test

test-watch:
	npm run test:watch
