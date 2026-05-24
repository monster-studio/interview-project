interface Props {
    label: string;
    disabled?: boolean;
    onClick: () => void;
}

export default function PokemonCardAction({ label, disabled = false, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="shrink-0 px-3 py-1.5 text-xs font-medium rounded border border-teal-500 text-slate-300 hover:border-teal-500 hover:text-teal-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
            {label}
        </button>
    );
}
