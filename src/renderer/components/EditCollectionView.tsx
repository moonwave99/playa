import { type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { type SearchResult } from "@/types/types";
import useCollection from "../query/useCollection";
import EntityCardList from "./EntityCardList";
import LookupEntityForm from "./LookupEntityForm";
import ErrorView from "./ErrorView";
import Loading from "./Loading";
import cx from "clsx";
import styles from "./EditCollectionView.module.css";
import formStyles from "../forms.module.css";

type EditCollectionViewProps = {
  id: number;
  closeModal: () => void;
};

export default function EditCollectionView({
  id,
  closeModal,
}: EditCollectionViewProps) {
  const { t } = useTranslation();
  const {
    collection,
    isPending,
    error,
    updateTitle,
    removeReleasesFromCollection,
    addReleasesToCollection,
  } = useCollection(id);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    updateTitle(data.get("title") as string);
    closeModal();
  }

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div className={styles.view}>
      <div className={cx(formStyles.container, formStyles.separator)}>
        <h2>{t("modals.EditCollectionView.title")}</h2>
        <form onSubmit={onSubmit} className={formStyles.form}>
          <div className={formStyles.actions}>
            <label className={cx(formStyles.label, styles.label)}>
              {t("modals.EditCollectionView.fields.title.label")}
              <input
                autoFocus
                className={cx(formStyles.input, styles.input)}
                required
                name="title"
                placeholder={t(
                  "modals.EditCollectionView.fields.title.placeholder"
                )}
                defaultValue={collection.title}
              />
            </label>
            <button type="submit" className={formStyles.button}>
              {t("modals.EditCollectionView.actions.save")}
            </button>
            <button
              type="button"
              className={formStyles.button}
              onClick={closeModal}
            >
              {t("modals.EditCollectionView.actions.cancel")}
            </button>
          </div>
        </form>
      </div>
      <div className={formStyles.container}>
        <h3>{t("modals.EditCollectionView.releases.title")}</h3>
        {collection.releases.length ? (
          <EntityCardList
            items={collection.releases}
            onRemoveEntityClick={(release) =>
              removeReleasesFromCollection([release])
            }
          />
        ) : (
          <p>{t("modals.EditCollectionView.releases.placeholder")}</p>
        )}
        <LookupEntityForm
          className={styles.lookupView}
          existingIds={collection.releases.map(({ id }) => id)}
          type="release"
          onSubmit={(result: SearchResult) => addReleasesToCollection([result])}
        />
      </div>
    </div>
  );
}
