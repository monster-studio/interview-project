import { render, screen, fireEvent } from "@testing-library/react";
import PokemonCardAction from "./PokemonCardAction";

describe("PokemonCardAction", () => {
    it("renders button with the provided label", () => {
        render(<PokemonCardAction label="Move to bag" onClick={jest.fn()} />);
        expect(screen.getByRole("button", { name: "Move to bag" })).toBeInTheDocument();
    });

    it("calls onClick when the button is clicked", () => {
        const onClick = jest.fn();
        render(<PokemonCardAction label="Move to bag" onClick={onClick} />);
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("is disabled when disabled prop is true", () => {
        render(<PokemonCardAction label="Move to bag" disabled={true} onClick={jest.fn()} />);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("is enabled by default", () => {
        render(<PokemonCardAction label="Remove from bag" onClick={jest.fn()} />);
        expect(screen.getByRole("button")).toBeEnabled();
    });

    it("does not call onClick when disabled", () => {
        const onClick = jest.fn();
        render(<PokemonCardAction label="Move to bag" disabled={true} onClick={onClick} />);
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).not.toHaveBeenCalled();
    });
});
