import { t } from "i18next";
import {
  ReleaseWithArtistAndTracksAndSubreleasesAndCollections,
  SearchResult,
} from "@/types/types";
import styles from "./EditReleaseView.module.css";
import formStyles from "@/renderer/forms.module.css";
import EntityCardList from "../EntityCardList";
import LookupEntityForm from "../LookupEntityForm";

type AdditionalArtistsEditorProps = {
  release: ReleaseWithArtistAndTracksAndSubreleasesAndCollections;
  onRemoveArtist: (id: number) => void;
  onSubmit: (artist: Pick<SearchResult, "id" | "title">) => void;
};

export default function AdditionalArtistsEditor({
  release,
  onRemoveArtist,
  onSubmit,
}: AdditionalArtistsEditorProps) {
  return (
    <div className={formStyles.container}>
      <h3>{t("modals.EditReleaseView.additionalArtists.title")}</h3>
      {release.additionalArtists.length ? (
        <EntityCardList
          items={release.additionalArtists}
          getRemoveButtonLabel={({ name }) =>
            t("modals.EditReleaseView.additionalArtists.actions.remove", {
              name,
            })
          }
          onRemoveEntityClick={({ id }) => onRemoveArtist(id)}
        />
      ) : (
        <p className={styles.placeholder}>
          {t("modals.EditReleaseView.additionalArtists.placeholder")}
        </p>
      )}
      <LookupEntityForm
        allowCustomValue
        className={styles.lookupView}
        existingIds={[
          release.artist.id,
          ...release.additionalArtists.map(({ id }) => id),
        ]}
        type="artist"
        onSubmit={onSubmit}
        placeholderText={t(
          "modals.EditReleaseView.additionalArtists.fields.lookup.placeholder"
        )}
      />
    </div>
  );
}
