import { vi, describe, it, expect } from "vitest";
import { withRouter } from "@/test/utils";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Link from "./Link";

describe("Link Component", () => {
    it("renders correctly", async () => {
        render(withRouter(<Link to="/">Homepage</Link>));

        await userEvent.click(screen.getByText("Homepage"));

        const element = screen.getByText("Homepage");
        expect(element).toBeInTheDocument();
    });

    it("calls the passed handler when clicked", async () => {
        const onClick = vi.fn();
        render(
            withRouter(
                <Link to="/" onClick={onClick}>
                    Homepage
                </Link>
            )
        );

        await userEvent.click(screen.getByText("Homepage"));
        expect(onClick).toHaveBeenCalled();
    });
});
