import { t } from "i18next";
import { ArtistWithReleasesFull, SearchResult } from "@/types/types";
import EntityCardList from "../EntityCardList";
import LookupEntityForm from "../LookupEntityForm";
import styles from "./EditArtistView.module.css";
import formStyles from "@/renderer/forms.module.css";

type RelatedArtistsEditorProps = {
  artist: ArtistWithReleasesFull;
  onRemoveArtist: (id: number) => void;
  onSubmit: (artist: Pick<SearchResult, "id" | "title">) => void;
};

export default function RelatedArtistsEditor({
  artist,
  onRemoveArtist,
  onSubmit,
}: RelatedArtistsEditorProps) {
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
      <LookupEntityForm
        className={styles.lookupView}
        existingIds={[artist.id, ...artist.relatedArtists.map(({ id }) => id)]}
        type="artist"
        onSubmit={onSubmit}
        placeholderText={t(
          "modals.EditArtistView.relatedArtists.fields.lookup.placeholder"
        )}
      />
    </div>
  );
}
