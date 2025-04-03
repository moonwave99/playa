import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "./Loading";

describe("Loading Component", () => {
    it("renders correctly", () => {
        render(<Loading />);
        const element = screen.getByText("Loading...");
        expect(element).toBeInTheDocument();
    });
});
