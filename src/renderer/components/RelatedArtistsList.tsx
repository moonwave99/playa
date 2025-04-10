import useArtist from "../query/useArtist";
import EntityList from "./EntityList";

type RelatedArtistsListProps = {
    id: number;
    useDarkText?: boolean;
};

export default function RelatedArtistsList({
    id,
    useDarkText,
}: RelatedArtistsListProps) {
    const { artist } = useArtist(id);
    if (!artist?.relatedArtists.length) {
        return null;
    }
    return (
        <EntityList
            items={artist.relatedArtists}
            label="Related artists:"
            useDarkText={useDarkText}
        />
    );
}
