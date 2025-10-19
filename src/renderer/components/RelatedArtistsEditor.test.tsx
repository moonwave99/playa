import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFakeArtist } from "@/test/seed";
import { withQueryClientProvider, withI18n } from "@/test/utils";
import RelatedArtistsEditor from "./RelatedArtistsEditor";
import api from "../__mocks__/api";
import {
  Artist,
  ArtistWithReleases,
  ArtistWithReleasesFull,
} from "@/types/types";

vi.mock("../api");

const relatedArtists = ["North", "South", "East", "West"].map((name, i) => ({
  ...getFakeArtist(i + 2),
  name,
})) as Artist[];

describe("RelatedArtistsEditor component", () => {
  it("renders correctly", async () => {
    api.artist.getArtist.mockResolvedValue({
      ...getFakeArtist(1),
      relatedArtists: [],
    } as ArtistWithReleasesFull);

    render(withQueryClientProvider(withI18n(<RelatedArtistsEditor id={1} />)));
    const title = await screen.findByText("Related Artists");
    expect(title).toBeInTheDocument();
    const placeholder = await screen.findByText("No artists yet.");
    expect(placeholder).toBeInTheDocument();
  });

  it("renders the current related artists in the list", async () => {
    api.artist.getArtist.mockResolvedValue({
      ...getFakeArtist(1),
      relatedArtists,
    } as ArtistWithReleasesFull);

    render(withQueryClientProvider(withI18n(<RelatedArtistsEditor id={1} />)));
    await Promise.all(
      relatedArtists.map(async ({ name }) => {
        const artist = await screen.findByText(name);
        expect(artist).toBeInTheDocument();
      })
    );
  });

  it("removes the artist from the list when clicking on the remove button", async () => {
    let clicked = false;

    api.artist.getArtist.mockImplementation(() =>
      Promise.resolve({
        ...getFakeArtist(1),
        relatedArtists: relatedArtists.filter((x) =>
          clicked ? x.id !== relatedArtists[0].id : true
        ),
      } as ArtistWithReleasesFull)
    );
    api.artist.removeRelatedArtist.mockImplementation(() =>
      Promise.resolve((clicked = true))
    );

    render(withQueryClientProvider(<RelatedArtistsEditor id={1} />));

    const artist = await screen.findByText(relatedArtists[0].name);
    expect(artist).toBeInTheDocument();

    await userEvent.click(
      screen.getByLabelText(
        `Remove ${relatedArtists[0].name} from related Artists`
      )
    );
    expect(artist).not.toBeInTheDocument();
  });

  it("adds the artist to the list when clicking on the add button", async () => {
    const user = userEvent.setup();
    let clicked = false;

    api.artist.getArtist.mockImplementation(() =>
      Promise.resolve({
        ...getFakeArtist(1),
        relatedArtists: clicked
          ? [relatedArtists[0], relatedArtists[1], relatedArtists[2]]
          : [relatedArtists[0], relatedArtists[1]],
      } as ArtistWithReleasesFull)
    );
    api.artist.addRelatedArtist.mockImplementation(() =>
      Promise.resolve((clicked = true))
    );
    api.artist.searchArtists.mockImplementation(({ query }) =>
      Promise.resolve(
        (clicked
          ? [relatedArtists[3]]
          : [relatedArtists[2], relatedArtists[3]]
        ).filter(({ name }) => name.includes(query)) as ArtistWithReleases[]
      )
    );

    render(withQueryClientProvider(withI18n(<RelatedArtistsEditor id={1} />)));
    const artist = await screen.findByText(relatedArtists[0].name);
    expect(artist).toBeInTheDocument();
    user.click(screen.getByLabelText("Lookup Artists"));
    await user.keyboard("East");

    const suggestion = await screen.findByText("East");
    expect(suggestion).toBeInTheDocument();

    await userEvent.click(
      await screen.findByLabelText("Add East to related Artists")
    );

    expect(suggestion).not.toBeInTheDocument();
    const addedArtist = await screen.findByTitle("[3]");

    expect(addedArtist).toBeInTheDocument();
  });
});
