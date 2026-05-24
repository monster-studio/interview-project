"use client";

import { TrainerPokemon } from "@/types";
import PokemonCard from "../PokemonCard/PokemonCard";
import AssignPokemonForm from "../AssignPokemonForm/AssignPokemonForm";

interface Props {
    trainerId: string | null;
    bank: TrainerPokemon[];
    bagFull: boolean;
    onMoveToBag: (id: string) => void;
    onAssigned: (tp: TrainerPokemon) => void;
}

export default function BankColumn({ trainerId, bank, bagFull, onMoveToBag, onAssigned }: Props) {
    return (
        <div className="flex flex-col gap-6 flex-1 min-w-0 bg-[#1B2B38] p-4 rounded-md">
            <section>
                {trainerId ? (
                    <AssignPokemonForm trainerId={trainerId} onAssigned={onAssigned} />
                ) : (
                    <div>
                        <h3 className="font-semibold text-white text-sm mb-3">Assign Pokémon</h3>
                        <p className="text-sm text-slate-500 italic">Select a trainer first.</p>
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="font-semibold text-white text-sm">Pokémon in the bank</h2>
                {!trainerId ? (
                    <p className="text-sm text-slate-500 italic">Select a trainer to view their bank.</p>
                ) : bank.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No Pokémon in the bank.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {bank.map((tp) => (
                            <PokemonCard
                                key={tp.id}
                                trainerPokemon={tp}
                                actionLabel="Move to bag"
                                actionDisabled={bagFull}
                                onAction={onMoveToBag}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
