import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { artist, removeRelatedArtist } = useArtist(id);

  if (!artist?.relatedArtists.length) {
    return null;
  }

  return (
    <EntityList
      i18nkey="entityList.actions.delete.relatedArtists"
      context={artist}
      items={artist.relatedArtists}
      label={t("components.RelatedArtistsList.label")}
      onDelete={removeRelatedArtist}
      {...rest}
    />
  );
}
