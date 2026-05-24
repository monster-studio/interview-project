"use client";

import BankColumn from "./BankColumn";
import BagColumn from "./BagColumn";
import { useTrainerPokemon } from "./useTrainerPokemon";

interface Props {
    trainerId: string | null;
}

export default function PokemonSection({ trainerId }: Props) {
    const { bag, bank, bagFull, addToBank, movePokemon } = useTrainerPokemon(trainerId);

    return (
        <div className="flex gap-6 flex-1 items-start">
            <BankColumn
                trainerId={trainerId}
                bank={bank}
                bagFull={bagFull}
                onMoveToBag={(id) => movePokemon(id, "BAG")}
                onAssigned={addToBank}
            />
            <BagColumn
                trainerId={trainerId}
                bag={bag}
                onMoveToBank={(id) => movePokemon(id, "BANK")}
            />
        </div>
    );
}
