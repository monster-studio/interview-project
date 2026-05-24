"use client";

import TrainerSelector from "@/components/TrainerSelector/TrainerSelector";
import CreateTrainerForm from "@/components/CreateTrainerForm/CreateTrainerForm";
import { Trainer } from "@/types";
import { useTrainers } from "./useTrainers";

interface Props {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function TrainerSection({ selectedId, onSelect }: Props) {
    const { trainers, addTrainer } = useTrainers();

    function handleCreated(trainer: Trainer) {
        addTrainer(trainer);
        onSelect(trainer.id);
    }

    return (
        <div className="flex flex-col bg-[#1B2B38] p-4 rounded-md mb-4">
            <div className="flex items-center gap-4 pb-5">
                <TrainerSelector trainers={trainers} selectedId={selectedId} onSelect={onSelect} />
            </div>
            <hr className="border-white/10 mb-5" />
            <div className="pb-1">
                <CreateTrainerForm onCreated={handleCreated} />
            </div>
        </div>
    );
}
