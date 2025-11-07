import { render, screen } from "@testing-library/react";
import { withI18n } from "@/test/utils";
import LookupView from "./LookupView";
import { getFakeSearchResults } from "@/test/seed";

describe("LookupView Component", () => {
  it("renders correctly", () => {
    render(
      withI18n(
        <LookupView
          items={getFakeSearchResults()}
          onChange={vi.fn()}
          getText={({ title }) => title}
        />
      )
    );
    expect(
      screen.getByPlaceholderText("Search for Entity")
    ).toBeInTheDocument();
  });
});
