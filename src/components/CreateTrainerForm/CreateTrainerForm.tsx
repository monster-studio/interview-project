"use client";

import { UserPlus } from "@phosphor-icons/react";
import { Trainer, Gender } from "@/types";
import { useCreateTrainerForm } from "./useCreateTrainerForm";

interface Props {
    onCreated: (trainer: Trainer) => void;
}

export default function CreateTrainerForm({ onCreated }: Props) {
    const { name, setName, gender, setGender, age, setAge, loading, error, handleSubmit } =
        useCreateTrainerForm(onCreated);

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Name</label>
                <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Value"
                    className="bg-[#1B2B38] border border-white/15 text-white placeholder-slate-100 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:border-teal-500"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Age</label>
                <input
                    required
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Value"
                    className="bg-[#1B2B38] border border-white/15 text-white placeholder-slate-100 rounded px-3 py-2 text-sm w-24 focus:outline-none focus:border-teal-500"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Gender</label>
                <div className="flex items-center gap-4 py-2">
                    {(["MALE", "FEMALE"] as Gender[]).map((g) => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-300">
                            <input
                                type="radio"
                                name="trainer-gender"
                                value={g}
                                checked={gender === g}
                                onChange={() => setGender(g)}
                                className="accent-teal-500"
                            />
                            {g === "MALE" ? "Male" : "Female"}
                        </label>
                    ))}
                </div>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="px-2 py-1 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
            >
                {loading ? "Adding…" : "Add new trainer"}
            </button>
            {error && <p className="text-xs text-red-400 w-full">{error}</p>}
        </form>
    );
}
