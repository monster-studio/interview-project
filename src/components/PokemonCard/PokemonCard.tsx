import { TrainerPokemon } from "@/types";
import PokemonCardImage from "./PokemonCardImage";
import PokemonCardInfo from "./PokemonCardInfo";
import PokemonCardAction from "./PokemonCardAction";

interface Props {
    trainerPokemon: TrainerPokemon;
    actionLabel: string;
    actionDisabled?: boolean;
    onAction: (id: string) => void;
}

export default function PokemonCard({ trainerPokemon, actionLabel, actionDisabled = false, onAction }: Props) {
    const { id, nickname, level, pokemon } = trainerPokemon;

    return (
        <div className="bg-[#182631] rounded-lg p-4">
            <div className="flex items-start gap-3">
                <PokemonCardImage name={pokemon.name} />
                <PokemonCardInfo name={pokemon.name} nickname={nickname} />
                <PokemonCardAction label={actionLabel} disabled={actionDisabled} onClick={() => onAction(id)} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
                Level: {level}&nbsp;&bull;&nbsp;{pokemon.types.join("/ ")}
            </p>
        </div>
    );
}
