import { render, screen, fireEvent } from "@testing-library/react";
import TrainerSelector from "./TrainerSelector";
import { Trainer } from "@/types";

const trainers: Trainer[] = [
    { id: "1", name: "Ash", gender: "MALE", age: 10 },
    { id: "2", name: "Misty", gender: "FEMALE", age: 12 },
];

describe("TrainerSelector", () => {
    it("renders the label text", () => {
        render(<TrainerSelector trainers={[]} selectedId={null} onSelect={jest.fn()} />);
        expect(screen.getByText("Select Trainer:")).toBeInTheDocument();
    });

    it("renders all trainer options", () => {
        render(<TrainerSelector trainers={trainers} selectedId={null} onSelect={jest.fn()} />);
        expect(screen.getByText("Ash")).toBeInTheDocument();
        expect(screen.getByText("Misty")).toBeInTheDocument();
    });

    it("shows placeholder when no trainer is selected", () => {
        render(<TrainerSelector trainers={trainers} selectedId={null} onSelect={jest.fn()} />);
        expect(screen.getByText("<Trainer name>")).toBeInTheDocument();
    });

    it("reflects the selectedId in the select value", () => {
        render(<TrainerSelector trainers={trainers} selectedId="2" onSelect={jest.fn()} />);
        expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("2");
    });

    it("calls onSelect with the trainer id when an option is chosen", () => {
        const onSelect = jest.fn();
        render(<TrainerSelector trainers={trainers} selectedId={null} onSelect={onSelect} />);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
        expect(onSelect).toHaveBeenCalledWith("1");
    });

    it("renders an empty list when no trainers are provided", () => {
        render(<TrainerSelector trainers={[]} selectedId={null} onSelect={jest.fn()} />);
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(1); // only the placeholder
    });
});
