"use client";

import { useState } from "react";
import Header from "@/components/Header/Header";
import TrainerSection from "@/components/TrainerSection/TrainerSection";
import PokemonSection from "@/components/PokemonSection/PokemonSection";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#182631] flex flex-col">
      <Header />
      <main className="flex flex-col flex-1 max-w-190 w-full mx-auto px-10 pt-6 pb-10">
        <TrainerSection selectedId={selectedId} onSelect={setSelectedId} />
        <PokemonSection trainerId={selectedId} />
      </main>
    </div>
  );
}
