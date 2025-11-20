import { t } from "i18next";
import { ArtistWithReleasesFull, SearchResult } from "@/types/types";
import EntityCardList from "@/renderer/components/EntityCardList";
import LookupEntityView from "@/renderer/components/Lookup/LookupEntityView";
import styles from "./EditArtistView.module.css";
import formStyles from "@/renderer/forms.module.css";

type RelatedArtistsEditorProps = {
  artist: ArtistWithReleasesFull;
  onRemoveArtist: (id: number) => void;
  onSelect: (artist: Pick<SearchResult, "id" | "title">) => void;
};

export default function RelatedArtistsEditor({
  artist,
  onRemoveArtist,
  onSelect,
}: RelatedArtistsEditorProps) {
  const existingIds = [artist.id, ...artist.relatedArtists.map(({ id }) => id)];
  return (
    <div className={formStyles.container}>
      <h3>{t("modals.EditArtistView.relatedArtists.title")}</h3>
      {artist.relatedArtists.length ? (
        <EntityCardList
          items={artist.relatedArtists}
          getRemoveButtonLabel={({ name }) =>
            t("modals.EditArtistView.relatedArtists.actions.remove", {
              name,
            })
          }
          onRemoveEntityClick={({ id }) => onRemoveArtist(id)}
        />
      ) : (
        <p className={styles.placeholder}>
          {t("modals.EditArtistView.relatedArtists.placeholder")}
        </p>
      )}
      <LookupEntityView
        allowCustomValue
        className={styles.lookupView}
        isEntityIncluded={({ id }) => existingIds.includes(id)}
        type="artist"
        onSelect={onSelect}
        placeholderText={t(
          "modals.EditArtistView.relatedArtists.fields.lookup.placeholder"
        )}
      />
    </div>
  );
}
