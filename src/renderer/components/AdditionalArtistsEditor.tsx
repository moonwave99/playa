import useRelease from "../query/useRelease";
import useSearchArtists from "../query/useSearchArtists";
import Loading from "./Loading";
import ArtistEditor from "./ArtistEditor";

type AdditionalArtistsEditorProps = {
    releaseId: number;
};

export default function AdditionalArtistsEditor({
    releaseId,
}: AdditionalArtistsEditorProps) {
    const { release, addAdditionalArtist, removeAdditionalArtist } = useRelease(
        { id: releaseId }
    );

    const { query, inputHandlers, results } = useSearchArtists({
        exclude: {
            key: "appearsIn",
            artist_id: release?.artist.id,
            release_id: release?.id,
        },
    });

    if (!release) {
        return <Loading />;
    }

    return (
        <ArtistEditor
            artists={release.additionalArtists}
            results={results}
            query={query}
            title="Additional Artists"
            onAdd={addAdditionalArtist}
            onRemove={removeAdditionalArtist}
            inputHandlers={inputHandlers}
        />
    );
}
