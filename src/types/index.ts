export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Location = "BAG" | "BANK";

export interface Trainer {
    id: string;
    name: string;
    gender: Gender;
    age: number;
}

export interface PokemonSpecies {
    id: string;
    number: number;
    name: string;
    types: string[];
}

export interface TrainerPokemon {
    id: string;
    nickname: string;
    level: number;
    gender: Gender;
    location: Location;
    trainerId: string;
    pokemonId: string;
    pokemon: PokemonSpecies;
}
