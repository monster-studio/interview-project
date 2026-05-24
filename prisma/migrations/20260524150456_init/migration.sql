-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Location" AS ENUM ('BAG', 'BANK');

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "types" TEXT[],

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerPokemon" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "location" "Location" NOT NULL DEFAULT 'BANK',
    "trainerId" TEXT NOT NULL,
    "pokemonId" TEXT NOT NULL,

    CONSTRAINT "TrainerPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_number_key" ON "Pokemon"("number");

-- AddForeignKey
ALTER TABLE "TrainerPokemon" ADD CONSTRAINT "TrainerPokemon_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerPokemon" ADD CONSTRAINT "TrainerPokemon_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
