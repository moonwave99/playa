import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { withI18n } from "@/test/utils";
import Cover from "./Cover";

describe("Cover Component", () => {
  it("renders correctly", () => {
    render(withI18n(<Cover id={1} title="My Title" hash="1234" />));
    const element = screen.getByAltText("Cover of My Title");
    expect(element).toBeInTheDocument();
  });
});
