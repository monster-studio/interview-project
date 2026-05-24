"use client";

import { Trainer } from "@/types";

interface Props {
    trainers: Trainer[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function TrainerSelector({ trainers, selectedId, onSelect }: Props) {
    return (
        <div className="flex items-center gap-3">
            <label htmlFor="trainer-select" className="text-sm text-slate-300 whitespace-nowrap">
                Select Trainer:
            </label>
            <select
                id="trainer-select"
                value={selectedId ?? ""}
                onChange={(e) => onSelect(e.target.value)}
                className="bg-[#1B2B38] border border-white/15 text-white rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-teal-500"
            >
                <option value="" disabled>
                    &lt;Trainer name&gt;
                </option>
                {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
