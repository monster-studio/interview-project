# Pokémon Trainer Manager — Build Planning Document

A milestone-based plan for building a Pokémon Trainer Management app with Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Zod.

---

## Milestone 1 — Project Initialization

### Task 1.1 — Bootstrap the Next.js project

**Description:** Scaffold a new Next.js 15 project with TypeScript, Tailwind CSS, ESLint, and the App Router. Establish the baseline configuration files (`next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`).

**Prompt:**
> Create a new Next.js 15 project using `create-next-app` with TypeScript, Tailwind CSS, ESLint, and the App Router. Name it `interview-project`.

---

### Task 1.2 — Configure Jest

**Description:** Add Jest and React Testing Library to support unit tests. Configure `jest.config.ts` and `jest.setup.ts` to work with the Next.js environment and TypeScript path aliases.

**Prompt:**
> Add Jest and React Testing Library to this Next.js 15 TypeScript project. Create `jest.config.ts` and `jest.setup.ts` with the correct configuration to support component and hook tests.

---

## Milestone 2 — Data Layer

### Task 2.1 — Define the Prisma schema

**Description:** Install Prisma and define three models: `Pokemon` (Pokédex species), `Trainer` (user profile), and `TrainerPokemon` (individual instance owned by a trainer). Include a `Gender` enum, a `Location` enum (`BAG` | `BANK`), and a unique constraint preventing the same species from being assigned twice to the same trainer.

**Prompt:**
> Set up Prisma with a PostgreSQL provider. Create three models:
> - `Pokemon` with fields: `id`, `number` (unique), `name` (unique), `types` (string array)
> - `Trainer` with fields: `id`, `name`, `gender` (enum: MALE, FEMALE, OTHER), `age`
> - `TrainerPokemon` with fields: `id`, `trainerId`, `pokemonId`, `nickname` (optional), `level`, `gender` (enum), `location` (enum: BAG, BANK)
> Add a unique constraint on `(trainerId, pokemonId)`. Generate the Prisma client output to `src/generated/prisma`.

---

### Task 2.2 — Create and run the database migration

**Description:** Generate the initial SQL migration from the Prisma schema and apply it to the database.

**Prompt:**
> Run the Prisma migration to create the initial database schema from the current `schema.prisma` file.

---

### Task 2.3 — Write the seed script

**Description:** Create `prisma/seed.ts` to populate the database with the first 40 Pokémon species, including their Pokédex number, name, and types array.

**Prompt:**
> Create a Prisma seed script at `prisma/seed.ts` that inserts the first 40 Pokémon species into the `Pokemon` table. Each entry should have a Pokédex number, name, and an array of types (e.g. `["Fire"]`, `["Water", "Flying"]`). Use `upsert` to make it idempotent.

---

### Task 2.4 — Define shared TypeScript types

**Description:** Create `src/types/index.ts` with the client-side interfaces and union types used across components and hooks: `Gender`, `Location`, `Trainer`, `PokemonSpecies`, and `TrainerPokemon`.

**Prompt:**
> Create `src/types/index.ts` with the following TypeScript types matching the Prisma schema:
> - `Gender = "MALE" | "FEMALE" | "OTHER"`
> - `Location = "BAG" | "BANK"`
> - `Trainer` interface (id, name, gender, age)
> - `PokemonSpecies` interface (id, number, name, types)
> - `TrainerPokemon` interface (id, trainerId, pokemonId, nickname, level, gender, location) with a nested `pokemon` field of type `PokemonSpecies`

---

### Task 2.5 — Create the Prisma client singleton

**Description:** Create `src/lib/prisma.ts` that exports a singleton Prisma client instance, safe for use in both development (with hot-reload) and production.

**Prompt:**
> Create `src/lib/prisma.ts` that exports a single shared instance of `PrismaClient`. Prevent multiple instances from being created during Next.js hot-reloads in development by caching it on the global object.

---

### Task 2.6 — Define Zod validation schemas

**Description:** Install Zod and create `src/lib/schemas.ts` with schemas for all API route inputs. Each schema coerces and validates the expected fields, so routes can call `safeParse` instead of casting or writing manual checks.

**Prompt:**
> Install `zod`. Create `src/lib/schemas.ts` with the following schemas:
> - `CreateTrainerSchema` — validates `name` (non-empty string), `gender` (enum MALE/FEMALE/OTHER), `age` (coerced integer ≥ 1)
> - `AssignPokemonSchema` — validates `pokemonId` (non-empty string), `nickname` (non-empty string), `level` (coerced integer 1–100), `gender` (enum)
> - `MovePokemonSchema` — validates `destination` (enum BAG/BANK)

---

## Milestone 3 — API Routes

### Task 3.1 — Trainers list and creation endpoint

**Description:** Implement `GET /api/trainers` to return all trainers, and `POST /api/trainers` to create a new trainer from a JSON body with `name`, `gender`, and `age`. Validate the body with `CreateTrainerSchema`.

**Prompt:**
> Create `src/app/api/trainers/route.ts` with:
> - `GET` handler returning all trainers from the database as JSON
> - `POST` handler parsing the body with `CreateTrainerSchema.safeParse`, returning 400 with `fieldErrors` on failure, creating a new `Trainer` record, and returning it with status 201

---

### Task 3.2 — Pokémon species list endpoint

**Description:** Implement `GET /api/pokemon` to return all Pokémon species, ordered by Pokédex number.

**Prompt:**
> Create `src/app/api/pokemon/route.ts` with a `GET` handler that returns all `Pokemon` records ordered by `number` ascending.

---

### Task 3.3 — Trainer's Pokémon list and assignment endpoint

**Description:** Implement `GET /api/trainers/[id]/pokemon` to return a trainer's Pokémon split into `bag` and `bank` arrays, and `POST` to assign a new Pokémon to the trainer's bank. Validate the body with `AssignPokemonSchema`.

**Prompt:**
> Create `src/app/api/trainers/[id]/pokemon/route.ts`:
> - `GET`: fetch all `TrainerPokemon` for the trainer, include the related `pokemon` species, and return `{ bag: [...], bank: [...] }` split by `location`
> - `POST`: parse the body with `AssignPokemonSchema.safeParse`, return 400 with `fieldErrors` on failure, create a new `TrainerPokemon` with `location: BANK`, return 201. Return 409 if the trainer already owns that species.

---

### Task 3.4 — Move Pokémon between bag and bank endpoint

**Description:** Implement `PATCH /api/trainer-pokemon/[id]/move` to toggle a Pokémon's location between `BAG` and `BANK`, enforcing the 6-Pokémon bag limit. Validate the body with `MovePokemonSchema`.

**Prompt:**
> Create `src/app/api/trainer-pokemon/[id]/move/route.ts` with a `PATCH` handler that:
> - Parses the body with `MovePokemonSchema.safeParse`, returning 400 with `fieldErrors` on failure
> - Fetches the `TrainerPokemon` record by id
> - If moving to BAG, counts how many Pokémon the trainer already has in BAG and returns 409 if it's already 6
> - Updates the `location` and returns the updated record as JSON

---

## Milestone 4 — Trainer Management UI

### Task 4.1 — Header component

**Description:** Create a `Header` component displaying the app name/logo in a styled top bar.

**Prompt:**
> Create `src/components/Header/Header.tsx` — a simple header bar with the app title "Pokémon Trainer Manager". Style it with Tailwind CSS using a dark background.

---

### Task 4.2 — `useTrainers` hook

**Description:** Create a custom hook that fetches the trainer list from `GET /api/trainers` and exposes an `addTrainer` function that appends a newly created trainer to the local state.

**Prompt:**
> Create `src/components/TrainerSection/useTrainers.ts` — a custom React hook that:
> - Fetches trainers from `GET /api/trainers` on mount
> - Returns `{ trainers, addTrainer }` where `addTrainer` accepts a `Trainer` object and appends it to the list

---

### Task 4.3 — `TrainerSelector` component

**Description:** Create a dropdown `<select>` component that lists all trainers and calls an `onSelect` callback when one is chosen.

**Prompt:**
> Create `src/components/TrainerSelector/TrainerSelector.tsx` — a controlled select dropdown that receives a `trainers` array, a `selectedId` string, and an `onSelect(id: string)` callback. Show a placeholder "Select a trainer" option when no trainer is selected.

---

### Task 4.4 — `useCreateTrainerForm` hook

**Description:** Create a hook managing form state (`name`, `age`, `gender`), validation, and submission to `POST /api/trainers`. On success it calls a provided `onCreated` callback with the new trainer.

**Prompt:**
> Create `src/components/CreateTrainerForm/useCreateTrainerForm.ts` — a hook that manages a trainer creation form. It should track `name`, `age`, and `gender` fields, expose change handlers and a `handleSubmit` function that POSTs to `/api/trainers` and calls `onCreated(trainer)` on success.

---

### Task 4.5 — `CreateTrainerForm` component

**Description:** Render a form with inputs for name, age, and gender using the `useCreateTrainerForm` hook. Display validation errors inline.

**Prompt:**
> Create `src/components/CreateTrainerForm/CreateTrainerForm.tsx` — a form component using the `useCreateTrainerForm` hook. Include text inputs for name and age, a select for gender (MALE, FEMALE, OTHER), a submit button, and inline error messages.

---

### Task 4.6 — `TrainerSection` component

**Description:** Compose `TrainerSelector`, `CreateTrainerForm`, and the `useTrainers` hook into a single section component. Calls `onTrainerSelect` when the selected trainer changes.

**Prompt:**
> Create `src/components/TrainerSection/TrainerSection.tsx` that uses `useTrainers` to fetch trainers, renders `TrainerSelector` and `CreateTrainerForm`, and calls `onTrainerSelect(id)` when a trainer is selected or a new one is created.

---

## Milestone 5 — Pokémon Management UI

### Task 5.1 — `PokemonCard` component family

**Description:** Build the `PokemonCard` component and its sub-components: `PokemonCardImage` (placeholder image), `PokemonCardInfo` (species name + optional nickname), and `PokemonCardAction` (a button with an icon).

**Prompt:**
> Create these components in `src/components/PokemonCard/`:
> - `PokemonCardImage.tsx` — displays a placeholder Pokémon image
> - `PokemonCardInfo.tsx` — shows the species name and, if provided, a nickname
> - `PokemonCardAction.tsx` — a button that receives an `onClick`, a `label`, and an icon; used to trigger bag/bank moves
> - `PokemonCard.tsx` — composes the three above to display a full Pokémon card given a `TrainerPokemon` object

---

### Task 5.2 — `useTrainerPokemon` hook

**Description:** Create a hook that fetches a trainer's `bag` and `bank` from `GET /api/trainers/[id]/pokemon` and exposes a `movePokemon` function that calls `PATCH /api/trainer-pokemon/[id]/move` and updates local state.

**Prompt:**
> Create `src/components/PokemonSection/useTrainerPokemon.ts` — a hook that takes a `trainerId` and:
> - Fetches `{ bag, bank }` from `GET /api/trainers/${trainerId}/pokemon`
> - Exposes `movePokemon(trainerPokemonId)` that calls `PATCH /api/trainer-pokemon/${id}/move` and updates the bag/bank state optimistically (or on success)
> - Returns `{ bag, bank, movePokemon, isLoading, error }`

---

### Task 5.3 — `useAssignPokemonForm` hook

**Description:** Create a hook managing the assignment form state (`pokemonId`, `nickname`, `level`, `gender`) and submission to `POST /api/trainers/[id]/pokemon`.

**Prompt:**
> Create `src/components/AssignPokemonForm/useAssignPokemonForm.ts` — a hook that:
> - Fetches all Pokémon species from `GET /api/pokemon` on mount
> - Tracks form fields: `pokemonId`, `nickname`, `level`, `gender`
> - Exposes `handleSubmit(trainerId)` that POSTs to `/api/trainers/${trainerId}/pokemon`
> - Calls `onAssigned(trainerPokemon)` on success

---

### Task 5.4 — `AssignPokemonForm` component

**Description:** Render a form for assigning a Pokémon to a trainer using the `useAssignPokemonForm` hook, with a species dropdown, nickname input, level input, and gender select.

**Prompt:**
> Create `src/components/AssignPokemonForm/AssignPokemonForm.tsx` that uses `useAssignPokemonForm`. Show a species dropdown populated from the API, a nickname text input, a level number input, a gender select, and a submit button.

---

### Task 5.5 — `BagColumn` component

**Description:** Display the trainer's active team (up to 6 Pokémon). Render a `PokemonCard` for each entry in the bag with an action button to move it to the bank.

**Prompt:**
> Create `src/components/PokemonSection/BagColumn.tsx` that receives a `bag` array of `TrainerPokemon` and a `onMove(id)` handler. Render each as a `PokemonCard` with an action button labelled "Send to Bank". Show the count (e.g. "3 / 6").

---

### Task 5.6 — `BankColumn` component

**Description:** Display the trainer's banked Pokémon and the `AssignPokemonForm`. Each card has an action button to move the Pokémon to the bag.

**Prompt:**
> Create `src/components/PokemonSection/BankColumn.tsx` that receives a `bank` array, a `trainerId`, a `onMove(id)` handler, and a `onAssigned` callback. Render each banked Pokémon as a `PokemonCard` with an "Add to Bag" action button. Include the `AssignPokemonForm` at the top of the column.

---

### Task 5.7 — `PokemonSection` component

**Description:** Compose `BagColumn`, `BankColumn`, and `useTrainerPokemon` into a two-column layout for managing a selected trainer's Pokémon.

**Prompt:**
> Create `src/components/PokemonSection/PokemonSection.tsx` that uses `useTrainerPokemon(trainerId)` and renders `BagColumn` and `BankColumn` side-by-side. When `trainerId` is null, show a prompt to select a trainer.

---

## Milestone 6 — Page Assembly

### Task 6.1 — Root layout

**Description:** Set up `src/app/layout.tsx` with global styles, a dark theme class, the `Header` component, and correct metadata.

**Prompt:**
> Update `src/app/layout.tsx` to include a dark background, import `globals.css`, render the `Header` component above `{children}`, and set `<html lang="en">`.

---

### Task 6.2 — Main page

**Description:** Wire `TrainerSection` and `PokemonSection` together in `src/app/page.tsx` using local state to track the currently selected trainer ID.

**Prompt:**
> Update `src/app/page.tsx` to hold a `selectedTrainerId` state. Render `TrainerSection` (passing `onTrainerSelect` to update the state) and `PokemonSection` (passing `selectedTrainerId`). Use a two-column layout with Tailwind.

---

## Milestone 7 — Tests

### Task 7.1 — Test `useTrainers` hook

**Description:** Write unit tests for `useTrainers` covering: initial fetch, successful load, adding a trainer, and error states.

**Prompt:**
> Write Jest tests for `src/components/TrainerSection/useTrainers.ts` using `@testing-library/react`'s `renderHook`. Mock `fetch`. Test: initial loading state, successful trainer list fetch, `addTrainer` appending to state, and fetch error handling.

---

### Task 7.2 — Test `useCreateTrainerForm` hook

**Description:** Write unit tests for `useCreateTrainerForm` covering field updates, successful submission, and API error handling.

**Prompt:**
> Write Jest tests for `useCreateTrainerForm.ts`. Mock `fetch`. Test: field change handlers update state correctly, `handleSubmit` POSTs the correct payload and calls `onCreated` with the response, and error responses set an error state.

---

### Task 7.3 — Test `useAssignPokemonForm` hook

**Description:** Write unit tests for `useAssignPokemonForm` covering species fetch on mount, field updates, and successful assignment submission.

**Prompt:**
> Write Jest tests for `useAssignPokemonForm.ts`. Mock `fetch` for both the species list and the assignment POST. Test: species are loaded on mount, fields update correctly, and `handleSubmit` calls `onAssigned` with the created `TrainerPokemon`.

---

### Task 7.4 — Test `TrainerSelector` component

**Description:** Write rendering and interaction tests for `TrainerSelector`, covering the placeholder option, rendering trainer names, and triggering `onSelect`.

**Prompt:**
> Write Jest + React Testing Library tests for `TrainerSelector.tsx`. Test: renders a "Select a trainer" placeholder, renders all trainer names as options, calls `onSelect` with the correct id when an option is chosen, and highlights the currently selected trainer.

---

### Task 7.5 — Test `PokemonCard` component

**Description:** Write rendering tests for `PokemonCard`, verifying species name, nickname, level, and type display.

**Prompt:**
> Write Jest + React Testing Library tests for `PokemonCard.tsx`. Test: renders the Pokémon species name, renders the nickname when provided, shows the level, and renders the action button with the correct label.

---

### Task 7.6 — Test `PokemonCardAction` component

**Description:** Write tests for `PokemonCardAction` verifying button rendering and click behavior.

**Prompt:**
> Write Jest + React Testing Library tests for `PokemonCardAction.tsx`. Test: renders the button with the given label, calls `onClick` when clicked, and can be rendered in a disabled state.
