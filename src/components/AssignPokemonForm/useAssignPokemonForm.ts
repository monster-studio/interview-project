"use client";

import { useState, useEffect } from "react";
import { Gender, PokemonSpecies, TrainerPokemon } from "@/types";

export function useAssignPokemonForm(trainerId: string, onAssigned: (tp: TrainerPokemon) => void) {
    const [species, setSpecies] = useState<PokemonSpecies[]>([]);
    const [pokemonId, setPokemonId] = useState("");
    const [nickname, setNickname] = useState("");
    const [level, setLevel] = useState("5");
    const [gender, setGender] = useState<Gender>("MALE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/pokemon")
            .then((r) => r.json())
            .then(setSpecies);
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`/api/trainers/${trainerId}/pokemon`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pokemonId, nickname, level: Number(level), gender }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Failed to assign Pokemon");
            }
            const tp: TrainerPokemon = await res.json();
            onAssigned(tp);
            setNickname("");
            setLevel("5");
            setPokemonId("");
            setGender("MALE");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return {
        species,
        pokemonId,
        setPokemonId,
        nickname,
        setNickname,
        level,
        setLevel,
        gender,
        setGender,
        loading,
        error,
        handleSubmit,
    };
}
