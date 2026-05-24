# Pokémon Trainer Manager — Build Planning Document

## Overview

A single-page web app that lets users manage Pokémon trainers and their Pokémon teams. Users can create trainers, assign Gen-1 Pokémon to a trainer's bank, and move Pokémon between a 6-slot active bag and an unlimited bank.

---

## Architecture

```
Browser (React SPA)
    │
    ├── Next.js App Router (page.tsx — "use client")
    │       ├── TrainerSection  ──── useTrainers, useCreateTrainerForm
    │       └── PokemonSection  ──── useTrainerPokemon, useAssignPokemonForm
    │
    └── Next.js API Routes (src/app/api/)
            ├── GET/POST  /api/trainers
            ├── GET/POST  /api/trainers/[id]/pokemon
            ├── GET       /api/pokemon
            └── PATCH     /api/trainer-pokemon/[id]/move
                    │
                    └── Prisma Client ──── PostgreSQL (pokemon_db)
```

Each component lives in its own folder with a co-located custom hook. The page (`page.tsx`) holds only the cross-cutting `selectedTrainerId` state; all data-fetching and mutation logic lives in hooks.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.6 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| ORM | Prisma | 7.8.0 |
| DB Driver | `@prisma/adapter-pg` | 7.8.0 |
| Database | PostgreSQL | 15+ |
| Validation | Zod | 4.4.3 |
| Icons | `@phosphor-icons/react` | 2.1.x |
| Test Runner | Jest | 29+ |
| Test Utils | `@testing-library/react` | 16.x |
| CI | GitHub Actions | — |

---

## Folder Structure

```
src/
  app/
    api/
      pokemon/route.ts                       ← GET /api/pokemon
      trainers/route.ts                      ← GET, POST /api/trainers
      trainers/[id]/pokemon/route.ts         ← GET, POST /api/trainers/:id/pokemon
      trainer-pokemon/[id]/move/route.ts     ← PATCH /api/trainer-pokemon/:id/move
    globals.css
    layout.tsx
    page.tsx
  components/
    Header/Header.tsx
    TrainerSection/TrainerSection.tsx
    TrainerSection/useTrainers.ts
    TrainerSection/useTrainers.test.ts
    TrainerSelector/TrainerSelector.tsx
    TrainerSelector/TrainerSelector.test.tsx
    CreateTrainerForm/CreateTrainerForm.tsx
    CreateTrainerForm/useCreateTrainerForm.ts
    CreateTrainerForm/useCreateTrainerForm.test.ts
    AssignPokemonForm/AssignPokemonForm.tsx
    AssignPokemonForm/useAssignPokemonForm.ts
    AssignPokemonForm/useAssignPokemonForm.test.ts
    PokemonSection/PokemonSection.tsx
    PokemonSection/useTrainerPokemon.ts
    PokemonSection/BagColumn.tsx
    PokemonSection/BankColumn.tsx
    PokemonCard/PokemonCard.tsx
    PokemonCard/PokemonCard.test.tsx
    PokemonCard/PokemonCardImage.tsx
    PokemonCard/PokemonCardInfo.tsx
    PokemonCard/PokemonCardAction.tsx
    PokemonCard/PokemonCardAction.test.tsx
  lib/
    prisma.ts      ← singleton PrismaClient
    schemas.ts     ← Zod validation schemas
  types/
    index.ts       ← shared TypeScript interfaces
  generated/
    prisma/        ← generated Prisma client (gitignored)
prisma/
  schema.prisma
  seed.ts          ← 151 Gen-1 Pokémon
  migrations/
.github/
  workflows/ci.yml ← GitHub Actions: lint + test on push/PR
```

---

## Key Design Decisions

**Folder-per-component with co-located hooks** — Each component directory owns its own custom hook, making it easy to find and change behaviour without navigating across a separate `hooks/` directory. Tests are also co-located in the same folder.

**API routes use Zod for validation** — Every route that accepts a body calls `schema.safeParse()` before touching the database. On failure it returns `{ error: fieldErrors }` with status 400, giving clients structured error detail.

**Bag limit enforced server-side** — The 6-Pokémon bag limit is checked inside `PATCH /api/trainer-pokemon/[id]/move`, not the client. This prevents bypassing the constraint through direct API calls.

**`TrainerPokemon` unique constraint removed** — The schema does not enforce a `@@unique([trainerId, pokemonId])` constraint, allowing a trainer to own multiple instances of the same species (like the mainline games).

**Prisma 7 driver adapter** — Prisma 7 removed the built-in `pg` driver. The project uses `@prisma/adapter-pg` explicitly, with the adapter instantiated in `src/lib/prisma.ts` and `prisma.config.ts`.

**`"use client"` at the page level** — `page.tsx` is marked as a Client Component so it can hold `selectedTrainerId` state. All child components inherit the client boundary; none make direct server-side data calls (all fetches go through the API layer).

---

## Milestone 1 — Project Initialization

### Task 1.1 — Bootstrap the Next.js project ✅

**Goal:** Scaffold the project with all baseline tooling in place so every subsequent task starts from a consistent, correctly typed environment.

**Prompt:**
> Create a new Next.js 15 project using `create-next-app` with TypeScript, Tailwind CSS, ESLint, and the App Router. Name it `interview-project`.

**Acceptance Criteria:**
- `npm run dev` starts without errors
- `npm run lint` exits clean
- `npm run build` produces a production build
- Path alias `@/` resolves to `src/`

**Output Files:** `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

---

### Task 1.2 — Configure Jest ✅

**Goal:** Add Jest and React Testing Library so unit tests can be written for hooks and components without additional setup per test file.

**Prompt:**
> Add Jest and React Testing Library to this Next.js 15 TypeScript project. Create `jest.config.ts` and `jest.setup.ts` with the correct configuration to support component and hook tests.

**Implementation Notes:**
- Use `next/jest` (SWC transformer) so the same fast compiler used by Next.js is used for tests — no separate Babel config needed.
- Set `testEnvironment: "jsdom"` for browser-like API access in tests.
- Use `setupFilesAfterEnv` (not `setupFiles`) to import `@testing-library/jest-dom` so jest-dom's custom matchers (`toBeInTheDocument`, `toBeDisabled`, etc.) are available after Jest globals are injected.
- `@types/jest` is required even with TypeScript because Jest types are not bundled with the package itself.

**Packages installed:** `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@types/jest`

**Output Files:** `jest.config.ts`, `jest.setup.ts`

**`jest.config.ts` key config:**
```ts
const config: Config = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
export default createJestConfig(config);
```

---

## Milestone 2 — Data Layer

### Task 2.1 — Define the Prisma schema ✅

**Goal:** Model the domain in PostgreSQL using Prisma, establishing the three core entities and their relationships.

**Prompt:**
> Set up Prisma with a PostgreSQL provider. Create three models:
> - `Pokemon` with fields: `id`, `number` (unique), `name`, `types` (string array)
> - `Trainer` with fields: `id`, `name`, `gender` (enum: MALE, FEMALE, OTHER), `age`
> - `TrainerPokemon` with fields: `id`, `trainerId`, `pokemonId`, `nickname`, `level`, `gender` (enum), `location` (enum: BAG, BANK)
> Generate the Prisma client output to `src/generated/prisma`.

**Implementation Notes:**
- `Pokemon.name` is **not** unique — two different trainers can own a Pikachu with different nicknames; uniqueness is enforced at the species level by `number`.
- `TrainerPokemon` has no `@@unique([trainerId, pokemonId])` constraint, allowing a trainer to own multiple instances of the same species (mirrors mainline game behaviour).
- `location` defaults to `BANK` so newly assigned Pokémon always start in the bank.
- `TrainerPokemon` → `Trainer` uses `onDelete: Cascade` so deleting a trainer cleans up all their Pokémon.
- Prisma 7 does not include a built-in driver; the `datasource` block specifies `provider = "postgresql"` and the actual pg connection is wired in application code via `@prisma/adapter-pg`.

**Output File:** `prisma/schema.prisma`

---

### Task 2.2 — Create and run the database migration ✅

**Goal:** Apply the Prisma schema to a local PostgreSQL database, creating all tables and enums.

**Prompt:**
> Run the Prisma migration to create the initial database schema from the current `schema.prisma` file.

**Implementation Notes:**
- Command: `npx prisma migrate dev --name init`
- Creates `prisma/migrations/20260524150456_init/migration.sql` with `CREATE TYPE`, `CREATE TABLE`, and foreign key statements.
- The `DATABASE_URL` environment variable must be set before running migrations. It is stored in `.env` (gitignored).

**Output Files:** `prisma/migrations/migration_lock.toml`, `prisma/migrations/20260524150456_init/migration.sql`

---

### Task 2.3 — Write the seed script ✅

**Goal:** Populate the `Pokemon` table with all 151 Generation-1 Pokémon species so the app has meaningful data on first run.

**Prompt:**
> Create a Prisma seed script at `prisma/seed.ts` that inserts all 151 Generation-1 Pokémon species into the `Pokemon` table. Each entry should have a Pokédex number, name, and an array of types (e.g. `["Fire"]`, `["Water", "Flying"]`). Use `upsert` to make it idempotent.

**Implementation Notes:**
- Uses `upsert` on `number` (the Pokédex number) as the unique key, so re-running the script is safe.
- The script instantiates its own `PrismaClient` with `PrismaPg` adapter (can't import from `src/lib/prisma` as that is inside the Next.js module boundary).
- Run via: `npm run db:seed`

**Output File:** `prisma/seed.ts`

---

### Task 2.4 — Define shared TypeScript types ✅

**Goal:** Establish a single source of truth for domain types used across both components and API route return values.

**Prompt:**
> Create `src/types/index.ts` with the following TypeScript types matching the Prisma schema:
> - `Gender = "MALE" | "FEMALE" | "OTHER"`
> - `Location = "BAG" | "BANK"`
> - `Trainer` interface (id, name, gender, age)
> - `PokemonSpecies` interface (id, number, name, types)
> - `TrainerPokemon` interface (id, trainerId, pokemonId, nickname, level, gender, location) with a nested `pokemon: PokemonSpecies`

**Implementation Notes:**
- These are pure TypeScript types — no runtime values. They intentionally mirror the Prisma-generated types so components never need to import from `@prisma/client`.
- `PokemonSpecies` is the name for the species model (named `Pokemon` in Prisma) to avoid clashing with the global `Pokemon` identifier.

**Output File:** `src/types/index.ts`

---

### Task 2.5 — Create the Prisma client singleton ✅

**Goal:** Provide a single shared `PrismaClient` instance that survives Next.js hot-reloads in development without accumulating open database connections.

**Prompt:**
> Create `src/lib/prisma.ts` that exports a single shared instance of `PrismaClient`. Prevent multiple instances from being created during Next.js hot-reloads in development by caching it on the global object.

**Implementation Notes:**
- In development, Next.js re-evaluates module files on every hot reload. Without caching, each reload creates a new connection pool, eventually exhausting available PostgreSQL connections.
- The pattern caches the instance on `globalThis` in development only (`process.env.NODE_ENV !== "production"`).
- Uses `PrismaPg` adapter from `@prisma/adapter-pg` to connect via `DATABASE_URL` from `process.env`.

**Output File:** `src/lib/prisma.ts`

---

### Task 2.6 — Define Zod validation schemas ✅

**Goal:** Centralise all API input validation in one file so routes stay thin and validation logic can be tested or reused independently.

**Prompt:**
> Install `zod`. Create `src/lib/schemas.ts` with the following schemas:
> - `CreateTrainerSchema` — validates `name` (non-empty string), `gender` (enum MALE/FEMALE/OTHER), `age` (coerced integer ≥ 1)
> - `AssignPokemonSchema` — validates `pokemonId` (non-empty string), `nickname` (non-empty string), `level` (coerced integer 1–100), `gender` (enum)
> - `MovePokemonSchema` — validates `destination` (enum BAG/BANK)

**Implementation Notes:**
- `age` and `level` use `z.number({ coerce: true })` to convert incoming JSON strings to numbers — handy for form submissions that serialise everything as strings.
- `GenderSchema` and `LocationSchema` are exported separately so they can be composed elsewhere without repeating the enum values.
- Every API route calls `schema.safeParse(body)` and returns `{ error: result.error.flatten().fieldErrors }` with status 400 on failure, giving clients a field-keyed error map.

**Output File:** `src/lib/schemas.ts`

---

## Milestone 3 — API Routes

### Task 3.1 — Trainers list and creation endpoint ✅

**Goal:** Provide a REST endpoint for fetching and creating trainers.

**Prompt:**
> Create `src/app/api/trainers/route.ts` with:
> - `GET` handler returning all trainers ordered by name
> - `POST` handler parsing the body with `CreateTrainerSchema.safeParse`, returning 400 with `fieldErrors` on failure, creating a new `Trainer` record, and returning it with status 201

**Endpoint Summary:**
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/trainers` | — | `Trainer[]` 200 |
| POST | `/api/trainers` | `{ name, gender, age }` | `Trainer` 201 / `{ error }` 400 |

**Output File:** `src/app/api/trainers/route.ts`

---

### Task 3.2 — Pokémon species list endpoint ✅

**Goal:** Serve the full list of available species so the assignment form can present a dropdown.

**Prompt:**
> Create `src/app/api/pokemon/route.ts` with a `GET` handler that returns all `Pokemon` records ordered by `number` ascending.

**Endpoint Summary:**
| Method | Path | Response |
|---|---|---|
| GET | `/api/pokemon` | `PokemonSpecies[]` ordered by Pokédex number |

**Output File:** `src/app/api/pokemon/route.ts`

---

### Task 3.3 — Trainer's Pokémon list and assignment endpoint ✅

**Goal:** Allow fetching a trainer's current roster (split into bag and bank) and assigning new Pokémon.

**Prompt:**
> Create `src/app/api/trainers/[id]/pokemon/route.ts`:
> - `GET`: fetch all `TrainerPokemon` for the trainer, include the related `pokemon` species, and return `{ bag: [...], bank: [...] }` split by `location`
> - `POST`: parse the body with `AssignPokemonSchema.safeParse`, return 400 on failure, create a `TrainerPokemon` with `location: BANK`, return 201

**Endpoint Summary:**
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/trainers/:id/pokemon` | — | `{ bag: TrainerPokemon[], bank: TrainerPokemon[] }` 200 |
| POST | `/api/trainers/:id/pokemon` | `{ pokemonId, nickname, level, gender }` | `TrainerPokemon` 201 / `{ error }` 400 |

**Implementation Notes:**
- Both bag and bank arrays include the nested `pokemon` species object (populated via Prisma `include`).
- Results are ordered alphabetically by species name for stable rendering.
- Newly assigned Pokémon always land in `BANK` regardless of the request body.

**Output File:** `src/app/api/trainers/[id]/pokemon/route.ts`

---

### Task 3.4 — Move Pokémon between bag and bank endpoint ✅

**Goal:** Allow moving a Pokémon between the active bag and the bank, enforcing the 6-Pokémon bag cap server-side.

**Prompt:**
> Create `src/app/api/trainer-pokemon/[id]/move/route.ts` with a `PATCH` handler that:
> - Parses the body with `MovePokemonSchema.safeParse`, returning 400 on failure
> - If moving to `BAG`, counts the trainer's current bag size and returns 409 if it's already 6
> - Updates the `location` and returns the updated record

**Endpoint Summary:**
| Method | Path | Body | Response |
|---|---|---|---|
| PATCH | `/api/trainer-pokemon/:id/move` | `{ destination: "BAG" \| "BANK" }` | `TrainerPokemon` 200 / `{ error }` 400 / `{ error }` 409 |

**Implementation Notes:**
- The bag-full check (`bagCount >= 6`) happens before the update, so the Pokémon being moved is not counted against the limit until it actually moves.
- Returns 404 if the `TrainerPokemon` record does not exist.
- The response includes the nested `pokemon` species object so the client can update local state directly from the response.

**Output File:** `src/app/api/trainer-pokemon/[id]/move/route.ts`

---

## Milestone 4 — Trainer Management UI

### Task 4.1 — Header component ✅

**Goal:** Provide a branded top bar that appears on every page.

**Prompt:**
> Create `src/components/Header/Header.tsx` — a header bar with the app logo. Style it with a dark background using Tailwind CSS.

**Implementation Notes:**
- Renders an `<img>` pointing to `public/logo.svg`.
- No props — it is purely presentational and stateless.
- Background: `bg-[#142029]` (slightly darker than the main page background `bg-[#182631]`).

**Output File:** `src/components/Header/Header.tsx`

---

### Task 4.2 — `useTrainers` hook ✅

**Goal:** Encapsulate all trainer list state so `TrainerSection` only deals with layout, not data fetching.

**Prompt:**
> Create `src/components/TrainerSection/useTrainers.ts` — a custom React hook that:
> - Fetches trainers from `GET /api/trainers` on mount
> - Returns `{ trainers, addTrainer }` where `addTrainer` accepts a `Trainer` object and appends it to the list

**Return shape:**
```ts
{ trainers: Trainer[], addTrainer: (t: Trainer) => void }
```

**Implementation Notes:**
- `addTrainer` appends optimistically to local state — no re-fetch needed after creation since the server returns the full `Trainer` object on `POST`.
- The hook has no loading or error state in the public API; these are handled silently (console errors in dev).

**Output Files:** `src/components/TrainerSection/useTrainers.ts`

---

### Task 4.3 — `TrainerSelector` component ✅

**Goal:** Give users a way to pick a trainer and load their Pokémon.

**Prompt:**
> Create `src/components/TrainerSelector/TrainerSelector.tsx` — a controlled select dropdown that receives a `trainers` array, a `selectedId` string, and an `onSelect(id: string)` callback. Show a placeholder "Select a trainer" option when no trainer is selected.

**Props:**
```ts
interface Props {
  trainers: Trainer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}
```

**Acceptance Criteria:**
- Renders a `<label>` with the text "Trainer"
- Shows a disabled "Select a trainer" placeholder as the first `<option>`
- Renders one `<option>` per trainer using `trainer.id` as `value` and `trainer.name` as display text
- Calls `onSelect` with the trainer's `id` when the user changes the selection

**Output Files:** `src/components/TrainerSelector/TrainerSelector.tsx`

---

### Task 4.4 — `useCreateTrainerForm` hook ✅

**Goal:** Isolate trainer creation form logic (state, validation error display, submission) so the component is thin.

**Prompt:**
> Create `src/components/CreateTrainerForm/useCreateTrainerForm.ts` — a hook that manages a trainer creation form. It should track `name`, `age`, and `gender` fields, expose change handlers and a `handleSubmit` function that POSTs to `/api/trainers` and calls `onCreated(trainer)` on success.

**Return shape:**
```ts
{
  name: string; age: string; gender: Gender;
  setName, setAge, setGender,
  handleSubmit: (e: FormEvent) => Promise<void>;
  loading: boolean; error: string | null;
}
```

**Implementation Notes:**
- `age` is kept as a string in local state (form input value) to preserve partial input like `""` during typing; the server coerces it to an integer via Zod.
- On success: clears all fields and calls `onCreated(trainer)`.
- On API error: sets `error` to the server's message string for display.

**Output File:** `src/components/CreateTrainerForm/useCreateTrainerForm.ts`

---

### Task 4.5 — `CreateTrainerForm` component ✅

**Goal:** Render the trainer creation form, binding it to `useCreateTrainerForm`.

**Prompt:**
> Create `src/components/CreateTrainerForm/CreateTrainerForm.tsx` — a form component using the `useCreateTrainerForm` hook. Include text inputs for name and age, a select for gender (MALE, FEMALE, OTHER), a submit button with a `UserPlus` icon, and inline error messages.

**Props:**
```ts
interface Props { onCreated: (trainer: Trainer) => void; }
```

**Acceptance Criteria:**
- Inputs are styled with `bg-[#1B2B38]`
- Submit button uses `bg-teal-500` and `@phosphor-icons/react`'s `UserPlus` icon
- Error message renders below the form when `error` is set
- Button is disabled while `loading` is true

**Output File:** `src/components/CreateTrainerForm/CreateTrainerForm.tsx`

---

### Task 4.6 — `TrainerSection` component ✅

**Goal:** Compose the trainer selector and creation form into a single section that manages trainer list state.

**Prompt:**
> Create `src/components/TrainerSection/TrainerSection.tsx` that uses `useTrainers` to fetch trainers, renders `TrainerSelector` and `CreateTrainerForm`, and calls `onSelect(id)` when a trainer is selected or a new one is created.

**Props:**
```ts
interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}
```

**Implementation Notes:**
- When a trainer is created via `CreateTrainerForm`, it is appended to the list via `addTrainer` and immediately passed to `onSelect` — so the new trainer is auto-selected.
- Renders `TrainerSelector` and `CreateTrainerForm` separated by an `<hr>` inside a rounded card (`bg-[#1B2B38] p-4 rounded-md mb-4`).

**Output File:** `src/components/TrainerSection/TrainerSection.tsx`

---

## Milestone 5 — Pokémon Management UI

### Task 5.1 — `PokemonCard` component family ✅

**Goal:** Build a reusable card component for displaying a single `TrainerPokemon`, decomposed into focused sub-components.

**Prompt:**
> Create these components in `src/components/PokemonCard/`:
> - `PokemonCardImage.tsx` — displays a placeholder Pokémon image
> - `PokemonCardInfo.tsx` — shows the species name and, if provided, a nickname
> - `PokemonCardAction.tsx` — a button that receives an `onClick`, a `label`, and optional `disabled`; used to trigger bag/bank moves
> - `PokemonCard.tsx` — composes the three above to display a full Pokémon card given a `TrainerPokemon` object

**`PokemonCard` Props:**
```ts
interface Props {
  pokemon: TrainerPokemon;
  actionLabel: string;
  onAction: (id: string) => void;
  actionDisabled?: boolean;
}
```

**Implementation Notes:**
- `PokemonCardImage` renders a Next.js `<Image>` pointing to `public/placeholder.svg` in a `bg-[#1c2d3e] border border-[#233641]` container.
- `PokemonCardInfo` renders the species name in white and the nickname in a muted colour below it.
- `PokemonCardAction` uses `border border-teal-500` styling; when `disabled`, the button is non-interactive.
- Card outer background: `bg-[#182631]`.

**Output Files:** `PokemonCard.tsx`, `PokemonCardImage.tsx`, `PokemonCardInfo.tsx`, `PokemonCardAction.tsx`

---

### Task 5.2 — `useTrainerPokemon` hook ✅

**Goal:** Manage bag/bank state for a selected trainer and handle moves between them.

**Prompt:**
> Create `src/components/PokemonSection/useTrainerPokemon.ts` — a hook that takes a `trainerId` and:
> - Fetches `{ bag, bank }` from `GET /api/trainers/${trainerId}/pokemon`
> - Exposes `movePokemon(trainerPokemonId, destination)` that calls `PATCH /api/trainer-pokemon/${id}/move` and updates bag/bank state from the response
> - Returns `{ bag, bank, movePokemon, addToBank }`

**Return shape:**
```ts
{
  bag: TrainerPokemon[];
  bank: TrainerPokemon[];
  movePokemon: (id: string, destination: Location) => Promise<void>;
  addToBank: (p: TrainerPokemon) => void;
}
```

**Implementation Notes:**
- Re-fetches from scratch whenever `trainerId` changes (uses `useEffect` with `trainerId` as dependency).
- The effect returns early with `if (!trainerId) return;` to comply with React Compiler rules (no conditional hook calls).
- `addToBank` appends optimistically so `AssignPokemonForm` can update the UI immediately after a successful POST without a re-fetch.
- After `movePokemon`, the bag/bank state is updated by re-assigning based on the `location` field of the returned record.

**Output File:** `src/components/PokemonSection/useTrainerPokemon.ts`

---

### Task 5.3 — `useAssignPokemonForm` hook ✅

**Goal:** Manage species loading and assignment form state in a hook so `AssignPokemonForm` stays thin.

**Prompt:**
> Create `src/components/AssignPokemonForm/useAssignPokemonForm.ts` — a hook that:
> - Fetches all Pokémon species from `GET /api/pokemon` on mount
> - Tracks form fields: `pokemonId`, `nickname`, `level`, `gender`
> - Exposes `handleSubmit(trainerId)` that POSTs to `/api/trainers/${trainerId}/pokemon`
> - Calls `onAssigned(trainerPokemon)` on success and resets all fields

**Return shape:**
```ts
{
  species: PokemonSpecies[];
  pokemonId: string; nickname: string; level: string; gender: Gender;
  setPokemonId, setNickname, setLevel, setGender,
  handleSubmit: (trainerId: string) => Promise<void>;
  loading: boolean; error: string | null;
}
```

**Output File:** `src/components/AssignPokemonForm/useAssignPokemonForm.ts`

---

### Task 5.4 — `AssignPokemonForm` component ✅

**Goal:** Render the Pokémon assignment form using the hook.

**Prompt:**
> Create `src/components/AssignPokemonForm/AssignPokemonForm.tsx` that uses `useAssignPokemonForm`. Show a species dropdown populated from the API, a nickname text input, a level number input, a gender select, and a submit button with a `PlusCircle` icon.

**Props:**
```ts
interface Props {
  trainerId: string;
  onAssigned: (p: TrainerPokemon) => void;
}
```

**Acceptance Criteria:**
- Species dropdown populates from the hook's `species` array
- Inputs use `bg-[#1B2B38]` styling
- Submit button uses `@phosphor-icons/react`'s `PlusCircle` icon
- Button is disabled while `loading` is true

**Output File:** `src/components/AssignPokemonForm/AssignPokemonForm.tsx`

---

### Task 5.5 — `BagColumn` component ✅

**Goal:** Display the trainer's active team (up to 6), with an action to send each Pokémon to the bank.

**Prompt:**
> Create `src/components/PokemonSection/BagColumn.tsx` that receives a `bag` array of `TrainerPokemon` and an `onMove(id)` handler. Render each as a `PokemonCard` with the action button labelled "Send to Bank". Show the count (e.g. "3 / 6").

**Props:**
```ts
interface Props { bag: TrainerPokemon[]; onMove: (id: string) => void; }
```

**Implementation Notes:**
- Shows `{bag.length} / 6` in the column header.
- Uses a `@phosphor-icons/react` `Info` icon in the header to visually indicate the bag limit.
- Background: `bg-[#1B2B38] p-4 rounded-md`.

**Output File:** `src/components/PokemonSection/BagColumn.tsx`

---

### Task 5.6 — `BankColumn` component ✅

**Goal:** Display banked Pokémon and the assignment form, with an action to add each to the bag.

**Prompt:**
> Create `src/components/PokemonSection/BankColumn.tsx` that receives a `bank` array, a `trainerId`, an `onMove(id)` handler, and an `onAssigned` callback. Render each banked Pokémon as a `PokemonCard` with "Add to Bag". Include `AssignPokemonForm` at the top.

**Props:**
```ts
interface Props {
  bank: TrainerPokemon[];
  trainerId: string;
  onMove: (id: string) => void;
  onAssigned: (p: TrainerPokemon) => void;
}
```

**Output File:** `src/components/PokemonSection/BankColumn.tsx`

---

### Task 5.7 — `PokemonSection` component ✅

**Goal:** Wire `BagColumn`, `BankColumn`, and `useTrainerPokemon` into a two-column layout.

**Prompt:**
> Create `src/components/PokemonSection/PokemonSection.tsx` that uses `useTrainerPokemon(trainerId)` and renders `BagColumn` and `BankColumn` side-by-side. When `trainerId` is null, show a prompt to select a trainer.

**Props:**
```ts
interface Props { trainerId: string | null; }
```

**Output File:** `src/components/PokemonSection/PokemonSection.tsx`

---

## Milestone 6 — Page Assembly

### Task 6.1 — Root layout ✅

**Goal:** Set up the shell HTML document with global styles, dark background, and the persistent header.

**Prompt:**
> Update `src/app/layout.tsx` to include a dark background, import `globals.css`, render the `Header` component above `{children}`, and set `<html lang="en">`.

**Implementation Notes:**
- `globals.css` uses Tailwind 4's `@import "tailwindcss"` syntax (not `@tailwind base/components/utilities`).
- `Header` is rendered inside `<body>` so it appears on all routes.

**Output File:** `src/app/layout.tsx`

---

### Task 6.2 — Main page ✅

**Goal:** Wire `TrainerSection` and `PokemonSection` together with shared `selectedId` state.

**Prompt:**
> Update `src/app/page.tsx` to hold a `selectedTrainerId` state. Render `TrainerSection` (passing `onSelect` to update the state) and `PokemonSection` (passing `selectedTrainerId`). Centre the content in a max-width container.

**Implementation Notes:**
- `"use client"` is required because the page holds `useState`.
- `selectedId` is `string | null` — null means no trainer is selected; `PokemonSection` shows a placeholder in that case.
- Layout: `min-h-screen bg-[#182631] flex flex-col` with content in `max-w-190 w-full mx-auto px-10 pt-6 pb-10`.

**Output File:** `src/app/page.tsx`

---

## Milestone 7 — Tests

### Task 7.1 — Test `useTrainers` hook ✅

**Goal:** Verify the trainer list is loaded on mount and that `addTrainer` correctly appends to state without triggering a re-fetch.

**Prompt:**
> Write Jest tests for `src/components/TrainerSection/useTrainers.ts` using `@testing-library/react`'s `renderHook`. Mock `fetch`. Test: initial empty list, successful trainer list fetch, `addTrainer` appending to state, and `addTrainer` preserving existing trainers.

**Test cases:**
- Starts with an empty trainer list
- Fetches trainers from `/api/trainers` on mount
- `addTrainer` appends the new trainer to the existing list
- `addTrainer` does not remove previously loaded trainers

**Output File:** `src/components/TrainerSection/useTrainers.test.ts`

---

### Task 7.2 — Test `useCreateTrainerForm` hook ✅

**Goal:** Verify form state management, correct API payload, success/error paths.

**Prompt:**
> Write Jest tests for `useCreateTrainerForm.ts`. Mock `fetch`. Test: initial state values, each setter updates its field, `handleSubmit` POSTs the correct payload and calls `onCreated` with the response, error responses set `error` state, network errors do not call `onCreated`.

**Test cases:**
- Initial state: `name = ""`, `age = ""`, `gender = "MALE"`, `loading = false`, `error = null`
- `setName`, `setAge`, `setGender` each update their respective field
- Successful submit calls `onCreated` with returned trainer and resets form
- Server 4xx response sets `error` and does not call `onCreated`
- POSTed body contains the correct `{ name, age, gender }` values
- Network error (fetch throws) does not call `onCreated`

**Output File:** `src/components/CreateTrainerForm/useCreateTrainerForm.test.ts`

---

### Task 7.3 — Test `useAssignPokemonForm` hook ✅

**Goal:** Verify species are loaded on mount, form fields update, and submission sends the right payload.

**Prompt:**
> Write Jest tests for `useAssignPokemonForm.ts`. Mock `fetch` for both the species list and the assignment POST. Test: species are loaded on mount, fields update correctly, and `handleSubmit` calls `onAssigned` with the created `TrainerPokemon`.

**Test cases:**
- Fetches species from `/api/pokemon` on mount and exposes them via `species`
- Initial form state: `pokemonId = ""`, `nickname = ""`, `level = ""`, `gender = "MALE"`
- `setPokemonId`, `setNickname`, `setLevel`, `setGender` each update their field
- Successful submit calls `onAssigned` with the returned `TrainerPokemon`
- POSTed body contains the correct `{ pokemonId, nickname, level, gender }` values
- Server error response sets `error` state

**Output File:** `src/components/AssignPokemonForm/useAssignPokemonForm.test.ts`

---

### Task 7.4 — Test `TrainerSelector` component ✅

**Goal:** Verify the dropdown renders correctly and fires callbacks.

**Prompt:**
> Write Jest + React Testing Library tests for `TrainerSelector.tsx`. Test: renders a "Select a trainer" placeholder, renders all trainer names as options, calls `onSelect` with the correct id when an option is chosen, and reflects the current `selectedId`.

**Test cases:**
- Renders a label with text "Trainer"
- Shows the "Select a trainer" placeholder as an option
- Renders one option per trainer with the trainer's name
- Calls `onSelect` with the trainer's id when a new option is selected
- `selectedId = null` keeps the placeholder selected
- `selectedId` matching a trainer keeps that trainer's option selected

**Output File:** `src/components/TrainerSelector/TrainerSelector.test.tsx`

---

### Task 7.5 — Test `PokemonCard` component ✅

**Goal:** Verify the card renders all data and wires up the action button correctly.

**Prompt:**
> Write Jest + React Testing Library tests for `PokemonCard.tsx`. Test: renders the Pokémon species name, nickname, level, type badges, and the action button with the correct label; `onAction` is called with the Pokémon id; `actionDisabled` disables the button.

**Test cases:**
- Renders the species name
- Renders the nickname
- Renders the level
- Renders each type as a visible badge
- Action button shows the given `actionLabel`
- Clicking the action button calls `onAction` with the `pokemon.id`
- `actionDisabled = true` disables the action button
- Button is enabled by default

**Output File:** `src/components/PokemonCard/PokemonCard.test.tsx`

---

### Task 7.6 — Test `PokemonCardAction` component ✅

**Goal:** Verify the action button's rendering, click, and disabled behaviour in isolation.

**Prompt:**
> Write Jest + React Testing Library tests for `PokemonCardAction.tsx`. Test: renders the button with the given label, calls `onClick` when clicked, is disabled when `disabled = true`, and is enabled by default.

**Test cases:**
- Renders a button with the provided label text
- Calls `onClick` handler when clicked
- When `disabled = true`, the button is not clickable
- Button is enabled by default (no `disabled` prop)
- `onClick` is not called when the button is disabled

**Output File:** `src/components/PokemonCard/PokemonCardAction.test.tsx`

---

**Test Summary:** 34 tests across 6 suites — all passing.

```
Test Suites: 6 passed, 6 total
Tests:       34 passed, 34 total
```

---

## Milestone 8 — CI / CD

### Task 8.1 — GitHub Actions CI workflow ✅

**Goal:** Run lint and all unit tests automatically on every push and pull request so regressions are caught before merging.

**Prompt:**
> Create a GitHub Actions workflow at `.github/workflows/ci.yml` that runs on every push and pull request to `main`/`master`. It should install dependencies with `npm ci`, run `npm run lint`, then run `npm test -- --no-coverage --ci`.

**Implementation Notes:**
- Uses `actions/setup-node@v4` with `cache: npm` to restore the `node_modules` cache between runs, significantly reducing install time on subsequent runs.
- `npm ci` is preferred over `npm install` in CI because it installs exactly from `package-lock.json` and fails if the lockfile is out of sync.
- `--ci` flag passed to Jest makes it fail immediately if any snapshot is outdated and disables interactive watch mode.
- `--no-coverage` skips generating a coverage report since there is no coverage threshold configured; omitting it would just add unnecessary time.
- The workflow does **not** run `npm run build` because the build requires a live `DATABASE_URL` for Prisma to connect; without a database service container configured, the build would always fail in CI. This can be added later with a Postgres service container.

**Workflow trigger matrix:**

| Event | Branch filter | Result |
|---|---|---|
| `push` | `main`, `master` | Runs lint + tests |
| `pull_request` | `main`, `master` | Runs lint + tests, blocks merge on failure |

**Output File:** `.github/workflows/ci.yml`

---

### Task 8.2 — Push to GitHub ✅

**Goal:** Upload the full project history to a remote GitHub repository so the CI workflow can run and the code is backed up and shareable.

**Steps taken:**
1. `git remote add origin https://github.com/monster-studio/interview-project.git`
2. `git add -A` — staged all project files (47 files)
3. `git commit -m "Initial commit: Next.js Pokemon trainer app with tests and CI"`
4. `git push -u origin HEAD` — pushed `master` branch and set upstream tracking

**Files excluded from the commit (gitignored):**
- `.env` — contains `DATABASE_URL` with database credentials
- `node_modules/` — installed via `npm ci` in CI
- `.next/` — build output
- `src/generated/prisma/` — generated Prisma client (rebuilt via `prisma generate`)
- `*.tsbuildinfo` — TypeScript incremental build cache
- `next-env.d.ts` — auto-generated by Next.js

**Repository:** `https://github.com/monster-studio/interview-project`

