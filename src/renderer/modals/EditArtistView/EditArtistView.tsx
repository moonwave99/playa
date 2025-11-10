import { useTranslation } from "react-i18next";
import { HasId } from "@/types/types";
import useArtist from "@/renderer/query/useArtist";

import EditArtistForm, { type NewInfo } from "./EditArtistForm";
import RelatedArtistsEditor from "./RelatedArtistsEditor";
import Loading from "@/renderer/components/Loading";

import cx from "clsx";
import styles from "./EditArtistView.module.css";
import formStyles from "@/renderer/forms.module.css";

type EditArtistViewProps = {
  id: number;
  closeModal: () => void;
};

export default function EditArtistView({
  id,
  closeModal,
}: EditArtistViewProps) {
  const { t } = useTranslation();
  const {
    artist,
    isPending,
    editArtist,
    addRelatedArtist,
    removeRelatedArtist,
  } = useArtist(id);

  function onSubmit({ newName }: NewInfo) {
    editArtist({
      ...artist,
      newName,
    });
    closeModal();
  }

  function onRelatedArtistsSubmit({ id }: HasId) {
    addRelatedArtist(id);
  }

  if (isPending) {
    return <Loading />;
  }

  return (
    <div className={styles.EditArtistView}>
      <div className={cx(formStyles.container, formStyles.separator)}>
        <h2>{t("modals.EditArtistView.title")}</h2>
        <EditArtistForm
          artist={artist}
          onCancel={closeModal}
          onSubmit={onSubmit}
        />
      </div>
      <RelatedArtistsEditor
        artist={artist}
        onSubmit={onRelatedArtistsSubmit}
        onRemoveArtist={removeRelatedArtist}
      />
    </div>
  );
}
