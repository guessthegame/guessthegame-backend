# Guess The Game - Backend

- [Local Dev](#-local-dev)
- [Code Quality](#-code-quality)
- [Tests](#-tests)
- [Dependencies](#-dependencies)
- [Deploy using docker compose](#-deploy-using-docker-compose)

## 💻 Local Dev

### Install dependencies

```bash
yarn install
```

### Start local dev database and tools

```bash
yarn db:up
```

### Migrate database & seed

```bash
yarn db:migrate
yarn db:seed
```

### Start development server

```bash
yarn dev
```

## ✨ Code Quality

- Run `yarn type-check` to run TypeScript's type checking
- Run `yarn prettier --write .` to format all files using Prettier
- Run `yarn eslint` to look for eslint errors

Before each commit, those three commands are automatically run by [Husky](https://github.com/typicode/husky) (configured via `lint-staged.config.js`)

ℹ️ If you need to commit files without Husky checking them, you can add the flag `--no-verify` to your commit command:

```bash
git commit --no-verify # Will skip code quality checks before commits
```

## ✔️ Tests

### Unit tests

```bash
yarn test
yarn test --watch # in watch mode
yarn test --coverage # with coverage
```

### E2E tests

For running e2e tests, you need a test database up and running:

```bash
yarn test:db:up
```

You can then run the tests:

```bash
yarn test:e2e
yarn test:e2e --watch # in watch mode
yarn test:e2e --coverage # with coverage
```

When done, you can stop the test database:

```bash
yarn test:db:down
```

## 🖇️ Dependencies

It is a good practice to pin dependencies to a fixed version.

To upgrade dependencies, you can use the following command:

```bash
yarn upgrade-interactive --latest
```

## 🚚 Deploy using docker-compose

### Configure

Create `.env` file based on `.env.example` file

```bash
cp .env.example .env
```

Then you need to edit, in the new `.env` file, the following:

- `API_JWT_SECRET`: change it to a random string (you can get one via https://www.grc.com/passwords.htm)
- `CORS_CLIENTS`: list here the url of allowed clients
- `DATABASE_URL`: Database credentials URL
- `THINGSBOARD_URL`: ThingsBoard URL (also change `THINGSBOARD_USERNAME` and `THINGSBOARD_PASSWORD` if needed)

### Start

```bash
# Start only API
docker-compose -f docker-compose.api.yml up --build -d

# OR Start DB + API
docker-compose -f docker-compose.db.yml -f docker-compose.api.yml up --build -d
```

### Migrate database

```bash
docker exec guessthegame-backend-api yarn db:migrate
```

## Database Backups

### Create a Database Backup (data only)

```bash
docker exec -t guessthegame-backend-database pg_dump horizon --data-only --insert -U root > dump.sql
```
