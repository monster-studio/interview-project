"use client";

import { Gender, TrainerPokemon } from "@/types";
import { useAssignPokemonForm } from "./useAssignPokemonForm";

interface Props {
    trainerId: string;
    onAssigned: (tp: TrainerPokemon) => void;
}

export default function AssignPokemonForm({ trainerId, onAssigned }: Props) {
    const {
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
    } = useAssignPokemonForm(trainerId, onAssigned);

    const inputCls =
        "bg-[#1B2B38] border border-white/15 text-white placeholder-slate-600 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-teal-500";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h3 className="font-semibold text-white text-sm">Assign Pokémon</h3>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Pokemon</label>
                <select
                    required
                    value={pokemonId}
                    onChange={(e) => setPokemonId(e.target.value)}
                    className={inputCls}
                >
                    <option value="" disabled>
                        Value
                    </option>
                    {species.map((s) => (
                        <option key={s.id} value={s.id}>
                            #{String(s.number).padStart(3, "0")} {s.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Nickname</label>
                <input
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Value"
                    className={inputCls}
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Level</label>
                <input
                    required
                    type="number"
                    min={1}
                    max={100}
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="Value"
                    className={inputCls}
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Gender</label>
                <div className="flex items-center gap-4 py-1">
                    {(["MALE", "FEMALE"] as Gender[]).map((g) => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-300">
                            <input
                                type="radio"
                                name="assign-gender"
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
                className="mt-1 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium rounded disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
                {loading ? "Assigning..." : "Assign Pokémon"}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
    );
}
