import useRelatedArtists from "../query/useRelatedArtists";
import Loading from "./Loading";
import ArtistEditor from "./ArtistEditor";

type RelatedArtistsEditorProps = {
    id: number;
};

export default function RelatedArtistsEditor({
    id,
}: RelatedArtistsEditorProps) {
    const {
        query,
        artist,
        inputHandlers,
        addRelatedArtist,
        removeRelatedArtist,
        results,
    } = useRelatedArtists(id);

    if (!artist) {
        return <Loading />;
    }

    return (
        <ArtistEditor
            artists={artist.relatedArtists}
            results={results}
            query={query}
            title="Related Artists"
            onAdd={addRelatedArtist}
            onRemove={removeRelatedArtist}
            inputHandlers={inputHandlers}
        />
    );
}
