import { z } from "zod";

export const GenderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);
export const LocationSchema = z.enum(["BAG", "BANK"]);

export const CreateTrainerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    gender: GenderSchema,
    age: z.number({ coerce: true }).int().min(1, "Age must be at least 1"),
});

export const AssignPokemonSchema = z.object({
    pokemonId: z.string().min(1, "pokemonId is required"),
    nickname: z.string().min(1, "Nickname is required"),
    level: z.number({ coerce: true }).int().min(1).max(100),
    gender: GenderSchema,
});

export const MovePokemonSchema = z.object({
    destination: LocationSchema,
});
