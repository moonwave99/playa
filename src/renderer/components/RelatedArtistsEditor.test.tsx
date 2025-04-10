import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getFakeArtist, withQueryClientProvider } from "@/test/utils";
import RelatedArtistsEditor from "./RelatedArtistsEditor";
import api from "../__mocks__/api";
import { Artist, ArtistWithReleasesFull } from "@/types/types";

vi.mock("../api");

describe("RelatedArtistsEditor component", () => {
    it("renders correctly", async () => {
        api.artist.getArtist.mockResolvedValue({
            ...getFakeArtist(1, undefined),
            relatedArtists: [],
        } as ArtistWithReleasesFull);

        render(withQueryClientProvider(<RelatedArtistsEditor id={1} />));
        const title = await screen.findByText("Related Artists");
        expect(title).toBeInTheDocument();
        const placeholder = await screen.findByText("No related artists yet.");
        expect(placeholder).toBeInTheDocument();
    });

    it("renders the current related artists in the list", async () => {
        const relatedArtists = [getFakeArtist(2), getFakeArtist(3)].map(
            (x) => ({
                ...x,
                name: `Artist ${x.id}`,
            })
        ) as Artist[];
        api.artist.getArtist.mockResolvedValue({
            ...getFakeArtist(1, undefined),
            relatedArtists,
        } as ArtistWithReleasesFull);

        render(withQueryClientProvider(<RelatedArtistsEditor id={1} />));
        await Promise.all(
            relatedArtists.map(async (x) => {
                const artist = await screen.findByText(`Artist ${x.id}`);
                expect(artist).toBeInTheDocument();
            })
        );
    });

    it("removes the artist from the list when clicking on the remove button", async () => {
        let clicked = false;
        const relatedArtists = [getFakeArtist(2), getFakeArtist(3)].map(
            (x) => ({
                ...x,
                name: `Artist ${x.id}`,
            })
        ) as Artist[];
        api.artist.getArtist.mockImplementation(() => {
            return Promise.resolve({
                ...getFakeArtist(1, undefined),
                relatedArtists: relatedArtists.filter((x) =>
                    clicked ? x.id !== 2 : true
                ),
            } as ArtistWithReleasesFull);
        });
        api.artist.removeRelatedArtist.mockImplementation(() => {
            clicked = true;
            return Promise.resolve(true);
        });

        render(withQueryClientProvider(<RelatedArtistsEditor id={1} />));
        const artist = await screen.findByText(
            `Artist ${relatedArtists[0].id}`
        );
        expect(artist).toBeInTheDocument();
        await userEvent.click(
            screen.getByLabelText(
                `Remove related artist: ${relatedArtists[0].name}`
            )
        );
        expect(artist).not.toBeInTheDocument();
    });
});
