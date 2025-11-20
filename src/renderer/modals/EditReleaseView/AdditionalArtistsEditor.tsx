import { t } from "i18next";
import {
  ReleaseWithArtistAndTracksAndSubreleasesAndCollections,
  SearchResult,
} from "@/types/types";
import EntityCardList from "@/renderer/components/EntityCardList";
import LookupEntityView from "@/renderer/components/Lookup/LookupEntityView";
import styles from "./EditReleaseView.module.css";
import formStyles from "@/renderer/forms.module.css";

type AdditionalArtistsEditorProps = {
  release: ReleaseWithArtistAndTracksAndSubreleasesAndCollections;
  onRemoveArtist: (id: number) => void;
  onSelect: (artist: Pick<SearchResult, "id" | "title">) => void;
};

export default function AdditionalArtistsEditor({
  release,
  onRemoveArtist,
  onSelect,
}: AdditionalArtistsEditorProps) {
  const existingIds = [
    release.artist.id,
    ...release.additionalArtists.map(({ id }) => id),
  ];
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
      <LookupEntityView
        allowCustomValue
        className={styles.lookupView}
        isEntityIncluded={({ id }) => existingIds.includes(id)}
        type="artist"
        onSelect={onSelect}
        placeholderText={t(
          "modals.EditReleaseView.additionalArtists.fields.lookup.placeholder"
        )}
      />
    </div>
  );
}
