import { type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { SearchResult } from "@/types/types";
import useGroup from "../query/useGroup";
import EntityCardList from "./EntityCardList";
import LookupEntityForm from "./LookupEntityForm";
import ErrorView from "./ErrorView";
import Loading from "./Loading";
import cx from "clsx";
import styles from "./EditGroupView.module.css";
import formStyles from "../forms.module.css";

type EditGroupViewProps = {
  id: number;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditGroupView({
  id,
  onSave,
  onCancel,
}: EditGroupViewProps) {
  const { t } = useTranslation();
  const {
    group,
    isPending,
    error,
    updateTitle,
    addArtistsToGroup,
    removeArtistsFromGroup,
  } = useGroup(id);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    updateTitle(data.get("title") as string);
    onSave();
  }

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div className={styles.view}>
      <div className={formStyles.container}>
        <h2>{t("modals.EditGroupView.title")}</h2>
        <form onSubmit={onSubmit} className={formStyles.form}>
          <div className={formStyles.actions}>
            <label className={cx(formStyles.label, styles.label)}>
              {t("modals.EditGroupView.fields.title.label")}
              <input
                autoFocus
                className={cx(formStyles.input, styles.input)}
                required
                name="title"
                placeholder={t("modals.EditGroupView.fields.title.placeholder")}
                defaultValue={group.title}
              />
            </label>
            <button type="submit" className={formStyles.button}>
              {t("modals.EditGroupView.actions.save")}
            </button>
            <button
              type="button"
              className={formStyles.button}
              onClick={onCancel}
            >
              {t("modals.EditGroupView.actions.cancel")}
            </button>
          </div>
        </form>
      </div>
      <div className={formStyles.container}>
        <h3>{t("modals.EditGroupView.artists.title")}</h3>
        {group.artists.length ? (
          <EntityCardList
            items={group.artists}
            onRemoveEntityClick={(artist) => removeArtistsFromGroup([artist])}
          />
        ) : (
          <p>{t("modals.EditGroupView.artists.placeholder")}</p>
        )}
        <LookupEntityForm
          className={styles.lookupView}
          existingIds={group.artists.map(({ id }) => id)}
          type="artist"
          onSubmit={(result: SearchResult) => addArtistsToGroup([result])}
        />
      </div>
    </div>
  );
}
