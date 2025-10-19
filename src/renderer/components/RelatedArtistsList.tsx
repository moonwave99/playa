import useArtist from "../query/useArtist";
import EntityList, { type EntityListProps } from "./EntityList";

type RelatedArtistsListProps = Pick<
  EntityListProps,
  "className" | "itemClassName" | "useDarkText"
> & {
  id: number;
};

export default function RelatedArtistsList({
  id,
  ...rest
}: RelatedArtistsListProps) {
  const { artist, removeRelatedArtist } = useArtist(id);

  if (!artist?.relatedArtists.length) {
    return null;
  }

  return (
    <EntityList
      i18nkey="entityList.actions.delete.relatedArtists"
      context={artist}
      items={artist.relatedArtists}
      label="Related artists"
      onDelete={removeRelatedArtist}
      {...rest}
    />
  );
}
