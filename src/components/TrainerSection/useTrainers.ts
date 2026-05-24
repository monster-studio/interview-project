"use client";

import { useState, useEffect } from "react";
import { Trainer } from "@/types";

export function useTrainers() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);

    useEffect(() => {
        fetch("/api/trainers")
            .then((r) => r.json())
            .then(setTrainers);
    }, []);

    function addTrainer(trainer: Trainer) {
        setTrainers((prev) => [...prev, trainer]);
    }

    return { trainers, addTrainer };
}
