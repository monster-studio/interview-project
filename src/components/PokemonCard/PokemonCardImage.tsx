import Image from "next/image";

interface Props {
    name: string;
}

export default function PokemonCardImage({ name }: Props) {
    return (
        <div className="w-14 h-14 shrink-0 rounded-md bg-[#1c2d3e] border border-[#233641] overflow-hidden">
            <Image src="/placeholder.svg" alt={name} width={56} height={56} />
        </div>
    );
}
