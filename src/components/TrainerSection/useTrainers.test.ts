import { renderHook, act, waitFor } from "@testing-library/react";
import { useTrainers } from "./useTrainers";
import { Trainer } from "@/types";

const mockTrainers: Trainer[] = [
    { id: "1", name: "Ash", gender: "MALE", age: 10 },
    { id: "2", name: "Misty", gender: "FEMALE", age: 12 },
];

describe("useTrainers", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("starts with an empty trainers list", () => {
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => [] });
        const { result } = renderHook(() => useTrainers());
        expect(result.current.trainers).toHaveLength(0);
    });

    it("fetches trainers from /api/trainers on mount", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => mockTrainers,
        });

        const { result } = renderHook(() => useTrainers());

        await waitFor(() => {
            expect(result.current.trainers).toHaveLength(2);
        });

        expect(global.fetch).toHaveBeenCalledWith("/api/trainers");
        expect(result.current.trainers[0].name).toBe("Ash");
        expect(result.current.trainers[1].name).toBe("Misty");
    });

    it("addTrainer appends a new trainer to the list", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => [] });
        const { result } = renderHook(() => useTrainers());

        const newTrainer: Trainer = { id: "3", name: "Brock", gender: "MALE", age: 15 };
        act(() => {
            result.current.addTrainer(newTrainer);
        });

        expect(result.current.trainers).toHaveLength(1);
        expect(result.current.trainers[0]).toEqual(newTrainer);
    });

    it("addTrainer preserves existing trainers", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({ json: async () => mockTrainers });
        const { result } = renderHook(() => useTrainers());

        await waitFor(() => expect(result.current.trainers).toHaveLength(2));

        const newTrainer: Trainer = { id: "3", name: "Brock", gender: "MALE", age: 15 };
        act(() => {
            result.current.addTrainer(newTrainer);
        });

        expect(result.current.trainers).toHaveLength(3);
        expect(result.current.trainers[2].name).toBe("Brock");
    });
});
