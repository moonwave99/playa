import type { FormEvent } from "react";
import useGroup from "../query/useGroup";
import EntityCardList from "./EntityCardList";
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
  const { group, isPending, error, updateTitle, removeArtistsFromGroup } =
    useGroup(id);

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
        <h2>Edit Group</h2>
        <form onSubmit={onSubmit} className={formStyles.form}>
          <label className={cx(formStyles.label, styles.label)}>
            Title
            <input
              autoFocus
              className={cx(formStyles.input, styles.input)}
              required
              name="title"
              placeholder="Enter the group title"
              defaultValue={group.title}
            />
          </label>

          <div className={formStyles.actions}>
            <button type="submit" className={formStyles.button}>
              Save
            </button>
            <button
              type="button"
              className={formStyles.button}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
        {group.artists.length ? (
          <section>
            <h3>Artists</h3>
            <EntityCardList
              items={group.artists}
              onRemoveEntityClick={(artist) => removeArtistsFromGroup([artist])}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
