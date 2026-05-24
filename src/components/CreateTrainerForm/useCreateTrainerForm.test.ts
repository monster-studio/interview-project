import { renderHook, act, waitFor } from "@testing-library/react";
import { useCreateTrainerForm } from "./useCreateTrainerForm";
import { Trainer } from "@/types";

const mockTrainer: Trainer = { id: "1", name: "Ash", gender: "MALE", age: 10 };

describe("useCreateTrainerForm", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("has correct initial state", () => {
        const { result } = renderHook(() => useCreateTrainerForm(jest.fn()));
        expect(result.current.name).toBe("");
        expect(result.current.age).toBe("");
        expect(result.current.gender).toBe("MALE");
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("updates name via setName", () => {
        const { result } = renderHook(() => useCreateTrainerForm(jest.fn()));
        act(() => {
            result.current.setName("Ash");
        });
        expect(result.current.name).toBe("Ash");
    });

    it("updates age via setAge", () => {
        const { result } = renderHook(() => useCreateTrainerForm(jest.fn()));
        act(() => {
            result.current.setAge("10");
        });
        expect(result.current.age).toBe("10");
    });

    it("updates gender via setGender", () => {
        const { result } = renderHook(() => useCreateTrainerForm(jest.fn()));
        act(() => {
            result.current.setGender("FEMALE");
        });
        expect(result.current.gender).toBe("FEMALE");
    });

    it("calls onCreated and resets form on successful submit", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockTrainer,
        });

        const onCreated = jest.fn();
        const { result } = renderHook(() => useCreateTrainerForm(onCreated));

        act(() => {
            result.current.setName("Ash");
            result.current.setAge("10");
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as React.FormEvent);
        });

        expect(onCreated).toHaveBeenCalledWith(mockTrainer);
        expect(result.current.name).toBe("");
        expect(result.current.age).toBe("");
        expect(result.current.gender).toBe("MALE");
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it("sets error message on API failure", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Name already taken" }),
        });

        const { result } = renderHook(() => useCreateTrainerForm(jest.fn()));

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as React.FormEvent);
        });

        expect(result.current.error).toBe("Name already taken");
        expect(result.current.loading).toBe(false);
    });

    it("sends the correct payload to the API", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockTrainer,
        });

        const { result } = renderHook(() => useCreateTrainerForm(jest.fn()));

        act(() => {
            result.current.setName("Ash");
            result.current.setAge("10");
            result.current.setGender("FEMALE");
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as React.FormEvent);
        });

        expect(global.fetch).toHaveBeenCalledWith("/api/trainers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Ash", gender: "FEMALE", age: 10 }),
        });
    });

    it("does not call onCreated when submit fails", async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

        const onCreated = jest.fn();
        const { result } = renderHook(() => useCreateTrainerForm(onCreated));

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: jest.fn(),
            } as unknown as React.FormEvent);
        });

        expect(onCreated).not.toHaveBeenCalled();
        expect(result.current.error).toBe("Network error");
    });
});
