import { renderHook, act, waitFor } from "@testing-library/react";
import { useAssignPokemonForm } from "./useAssignPokemonForm";
import { PokemonSpecies, TrainerPokemon } from "@/types";

const mockSpecies: PokemonSpecies[] = [
    { id: "p1", number: 1, name: "Bulbasaur", types: ["Grass", "Poison"] },
    { id: "p25", number: 25, name: "Pikachu", types: ["Electric"] },
];

const mockTrainerPokemon: TrainerPokemon = {
    id: "tp1",
    nickname: "Sparky",
    level: 25,
    gender: "MALE",
    location: "BANK",
    trainerId: "trainer1",
    pokemonId: "p25",
    pokemon: mockSpecies[1],
};

describe("useAssignPokemonForm", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("fetches species from /api/pokemon on mount", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => mockSpecies,
        });

        const { result } = renderHook(() => useAssignPokemonForm("trainer1", jest.fn()));

        await waitFor(() => {
            expect(result.current.species).toHaveLength(2);
        });

        expect(global.fetch).toHaveBeenCalledWith("/api/pokemon");
        expect(result.current.species[1].name).toBe("Pikachu");
    });

    it("has correct initial form state", () => {
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => [] });
        const { result } = renderHook(() => useAssignPokemonForm("trainer1", jest.fn()));

        expect(result.current.pokemonId).toBe("");
        expect(result.current.nickname).toBe("");
        expect(result.current.level).toBe("5");
        expect(result.current.gender).toBe("MALE");
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("updates form fields via setters", () => {
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => [] });
        const { result } = renderHook(() => useAssignPokemonForm("trainer1", jest.fn()));

        act(() => {
            result.current.setPokemonId("p25");
            result.current.setNickname("Sparky");
            result.current.setLevel("30");
            result.current.setGender("FEMALE");
        });

        expect(result.current.pokemonId).toBe("p25");
        expect(result.current.nickname).toBe("Sparky");
        expect(result.current.level).toBe("30");
        expect(result.current.gender).toBe("FEMALE");
    });

    it("calls onAssigned and resets the form on successful submit", async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ json: async () => mockSpecies })
            .mockResolvedValueOnce({ ok: true, json: async () => mockTrainerPokemon });

        const onAssigned = jest.fn();
        const { result } = renderHook(() => useAssignPokemonForm("trainer1", onAssigned));

        await waitFor(() => expect(result.current.species).toHaveLength(2));

        act(() => {
            result.current.setPokemonId("p25");
            result.current.setNickname("Sparky");
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as React.FormEvent);
        });

        expect(onAssigned).toHaveBeenCalledWith(mockTrainerPokemon);
        expect(result.current.pokemonId).toBe("");
        expect(result.current.nickname).toBe("");
        expect(result.current.level).toBe("5");
        expect(result.current.gender).toBe("MALE");
        expect(result.current.loading).toBe(false);
    });

    it("sends correct payload to the trainer pokemon API", async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ json: async () => [] })
            .mockResolvedValueOnce({ ok: true, json: async () => mockTrainerPokemon });

        const { result } = renderHook(() => useAssignPokemonForm("trainer1", jest.fn()));

        act(() => {
            result.current.setPokemonId("p25");
            result.current.setNickname("Sparky");
            result.current.setLevel("25");
            result.current.setGender("MALE");
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as React.FormEvent);
        });

        expect(global.fetch).toHaveBeenLastCalledWith("/api/trainers/trainer1/pokemon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pokemonId: "p25", nickname: "Sparky", level: 25, gender: "MALE" }),
        });
    });

    it("sets error on API failure", async () => {
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ json: async () => [] })
            .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Bag is full" }) });

        const { result } = renderHook(() => useAssignPokemonForm("trainer1", jest.fn()));

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as React.FormEvent);
        });

        expect(result.current.error).toBe("Bag is full");
        expect(result.current.loading).toBe(false);
    });
});
