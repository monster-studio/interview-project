"use client";

import { useState } from "react";
import { Trainer, Gender } from "@/types";

export function useCreateTrainerForm(onCreated: (trainer: Trainer) => void) {
    const [name, setName] = useState("");
    const [gender, setGender] = useState<Gender>("MALE");
    const [age, setAge] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/trainers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, gender, age: Number(age) }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Failed to create trainer");
            }
            const trainer: Trainer = await res.json();
            onCreated(trainer);
            setName("");
            setAge("");
            setGender("MALE");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return { name, setName, gender, setGender, age, setAge, loading, error, handleSubmit };
}
