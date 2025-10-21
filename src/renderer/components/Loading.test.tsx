import { render, screen } from "@testing-library/react";
import { withI18n } from "@/test/utils";
import Loading from "./Loading";

describe("Loading Component", () => {
  it("renders correctly", () => {
    render(withI18n(<Loading />));
    const element = screen.getByLabelText("Loading...");
    expect(element).toBeInTheDocument();
  });
});
