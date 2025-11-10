import { useTranslation } from "react-i18next";
import api from "@/renderer/api";
import useRelease from "@/renderer/query/useRelease";
import type { EditReleaseParam, SearchResult } from "@/types/types";

import EditReleaseForm from "./EditReleaseForm";
import AdditionalArtistsEditor from "./AdditionalArtistsEditor";
import Loading from "@/renderer/components/Loading";

import styles from "./EditReleaseView.module.css";

type EditReleaseViewProps = {
  id: number;
  closeModal: () => void;
};

export default function EditReleaseView({
  id,
  closeModal,
}: EditReleaseViewProps) {
  const { t } = useTranslation();
  const {
    isPending,
    release,
    addNewAdditionalArtist,
    addAdditionalArtist,
    removeAdditionalArtist,
    editRelease,
  } = useRelease({
    id,
  });

  function onSubmit(infos: EditReleaseParam[]) {
    editRelease(infos);
    api.state.setSelection("release", []);
    closeModal();
  }

  function onAdditionalArtistSubmit({
    id,
    title,
  }: Pick<SearchResult, "id" | "title">) {
    if (!id) {
      addNewAdditionalArtist(title);
      return;
    }
    addAdditionalArtist(id);
  }

  if (isPending) {
    return <Loading />;
  }

  return (
    <div className={styles.EditReleaseView}>
      <h2>{t(`modals.EditReleaseView.title`)}</h2>
      <EditReleaseForm
        release={release}
        onSubmit={onSubmit}
        onCancel={closeModal}
      />
      <AdditionalArtistsEditor
        release={release}
        onRemoveArtist={removeAdditionalArtist}
        onSubmit={onAdditionalArtistSubmit}
      />
    </div>
  );
}
