interface Props {
    name: string;
    nickname: string;
}

export default function PokemonCardInfo({ name, nickname }: Props) {
    return (
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm leading-tight">{name}</p>
            <p className="text-xs text-slate-400 mt-0.5">Nickname: {nickname}</p>
        </div>
    );
}
