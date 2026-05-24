"use client";

import { useState, useEffect } from "react";
import { TrainerPokemon } from "@/types";

export function useTrainerPokemon(trainerId: string | null) {
    const [bag, setBag] = useState<TrainerPokemon[]>([]);
    const [bank, setBank] = useState<TrainerPokemon[]>([]);

    useEffect(() => {
        if (!trainerId) return;
        let cancelled = false;
        fetch(`/api/trainers/${trainerId}/pokemon`)
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) {
                    setBag(data.bag ?? []);
                    setBank(data.bank ?? []);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [trainerId]);

    function addToBank(tp: TrainerPokemon) {
        setBank((prev) => [...prev, tp]);
    }

    async function movePokemon(id: string, destination: "BAG" | "BANK"): Promise<void> {
        const res = await fetch(`/api/trainer-pokemon/${id}/move`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destination }),
        });
        if (!res.ok) {
            const data = await res.json();
            alert(data.error ?? "Failed to move Pokémon");
            return;
        }
        const updated: TrainerPokemon = await res.json();
        if (destination === "BAG") {
            setBank((prev) => prev.filter((p) => p.id !== id));
            setBag((prev) => [...prev, updated]);
        } else {
            setBag((prev) => prev.filter((p) => p.id !== id));
            setBank((prev) => [...prev, updated]);
        }
    }

    return { bag, bank, bagFull: bag.length >= 6, addToBank, movePokemon };
}
