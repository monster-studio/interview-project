"use client";

import { Info } from "@phosphor-icons/react";
import PokemonCard from "@/components/PokemonCard/PokemonCard";
import { TrainerPokemon } from "@/types";

interface Props {
    trainerId: string | null;
    bag: TrainerPokemon[];
    onMoveToBank: (id: string) => void;
}

export default function BagColumn({ trainerId, bag, onMoveToBank }: Props) {
    return (
        <section className="flex flex-col gap-3 flex-1 min-w-0 bg-[#1B2B38] p-4 rounded-md">
            <h2 className="font-semibold text-white text-sm">Pokémon in the bag</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Info size={13} weight="fill" className="shrink-0" />
                You can only have 6 Pokémon in a bag at a time
            </p>
            {!trainerId ? (
                <p className="text-sm text-slate-500 italic">Select a trainer to view their bag.</p>
            ) : bag.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No Pokémon in the bag.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {bag.map((tp) => (
                        <PokemonCard
                            key={tp.id}
                            trainerPokemon={tp}
                            actionLabel="Remove from bag"
                            onAction={onMoveToBank}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
