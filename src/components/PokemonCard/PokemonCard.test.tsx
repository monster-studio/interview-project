import { render, screen, fireEvent } from "@testing-library/react";
import PokemonCard from "./PokemonCard";
import { TrainerPokemon } from "@/types";

const mockTrainerPokemon: TrainerPokemon = {
    id: "tp1",
    nickname: "Sparky",
    level: 25,
    gender: "MALE",
    location: "BANK",
    trainerId: "trainer1",
    pokemonId: "p25",
    pokemon: { id: "p25", number: 25, name: "Pikachu", types: ["Electric"] },
};

describe("PokemonCard", () => {
    it("renders pokemon name, nickname, level, and types", () => {
        render(
            <PokemonCard trainerPokemon={mockTrainerPokemon} actionLabel="Move to bag" onAction={jest.fn()} />,
        );

        expect(screen.getByText("Pikachu")).toBeInTheDocument();
        expect(screen.getByText("Nickname: Sparky")).toBeInTheDocument();
        expect(screen.getByText(/Level: 25/)).toBeInTheDocument();
        expect(screen.getByText(/Electric/)).toBeInTheDocument();
    });

    it("renders the action button with the given label", () => {
        render(
            <PokemonCard trainerPokemon={mockTrainerPokemon} actionLabel="Move to bag" onAction={jest.fn()} />,
        );

        expect(screen.getByRole("button", { name: "Move to bag" })).toBeInTheDocument();
    });

    it("calls onAction with the trainer-pokemon id when button is clicked", () => {
        const onAction = jest.fn();
        render(
            <PokemonCard trainerPokemon={mockTrainerPokemon} actionLabel="Move to bag" onAction={onAction} />,
        );

        fireEvent.click(screen.getByRole("button"));
        expect(onAction).toHaveBeenCalledWith("tp1");
    });

    it("disables the button when actionDisabled is true", () => {
        render(
            <PokemonCard
                trainerPokemon={mockTrainerPokemon}
                actionLabel="Move to bag"
                actionDisabled={true}
                onAction={jest.fn()}
            />,
        );

        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("enables the button by default", () => {
        render(
            <PokemonCard trainerPokemon={mockTrainerPokemon} actionLabel="Move to bag" onAction={jest.fn()} />,
        );

        expect(screen.getByRole("button")).toBeEnabled();
    });
});
