# Pokémon Trainer Manager

A single-page web app for managing Pokémon trainers and their teams. Create trainers, assign Generation-1 Pokémon from a species catalogue, and move Pokémon between a trainer's 6-slot active bag and an unlimited bank.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Validation | Zod |
| Icons | Phosphor Icons |
| Tests | Jest + React Testing Library |
| CI | GitHub Actions |

## Prerequisites

- Node.js 22+
- PostgreSQL 15+ running locally (or a connection string to a remote instance)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/pokemon_db"
```

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Seed the database

Populates the `Pokemon` table with all 151 Generation-1 species:

```bash
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database with Gen-1 Pokémon |

## Project Structure

```
src/
  app/
    api/                          # API routes
      pokemon/                    # GET  /api/pokemon
      trainers/                   # GET, POST /api/trainers
      trainers/[id]/pokemon/      # GET, POST /api/trainers/:id/pokemon
      trainer-pokemon/[id]/move/  # PATCH /api/trainer-pokemon/:id/move
    layout.tsx
    page.tsx                      # Root page ("use client")
  components/
    Header/
    TrainerSection/               # Trainer list + create form
    TrainerSelector/              # Trainer dropdown
    CreateTrainerForm/            # Trainer creation form
    PokemonSection/               # Bag + bank columns
    AssignPokemonForm/            # Pokémon assignment form
    PokemonCard/                  # Individual Pokémon card
  lib/
    prisma.ts                     # Singleton PrismaClient
    schemas.ts                    # Zod validation schemas
  types/
    index.ts                      # Shared TypeScript interfaces
prisma/
  schema.prisma
  seed.ts
```

Each component lives in its own folder with a co-located custom hook (e.g. `TrainerSection/useTrainers.ts`) and co-located tests (e.g. `TrainerSection/useTrainers.test.ts`).

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/trainers` | List all trainers |
| `POST` | `/api/trainers` | Create a trainer `{ name, gender, age }` |
| `GET` | `/api/pokemon` | List all Pokémon species |
| `GET` | `/api/trainers/:id/pokemon` | Get trainer's `{ bag, bank }` |
| `POST` | `/api/trainers/:id/pokemon` | Assign a Pokémon to the bank |
| `PATCH` | `/api/trainer-pokemon/:id/move` | Move between bag and bank `{ destination }` |

## Rules

- A trainer's bag holds a maximum of **6 Pokémon**.
- Newly assigned Pokémon always start in the **bank**.
- The bag limit is enforced server-side; the API returns `409` when full.

## Running Tests

```bash
npm test
```

34 tests across 6 suites covering all custom hooks and key UI components.

## CI

GitHub Actions runs lint and all tests on every push and pull request to `main`/`master`. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
