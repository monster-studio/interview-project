import Image from "next/image";

export default function Header() {
    return (
        <header className="bg-[#142029] px-10 py-3.5 flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo" width={20} height={40} className="h-7 w-auto" />
            <h1 className="text-white font-semibold text-base tracking-wide">Trainer management</h1>
        </header>
    );
}
