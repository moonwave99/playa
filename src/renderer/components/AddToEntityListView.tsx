import { type FormEvent } from "react";
import type {
  Group,
  Collection,
  ArtistWithReleases,
  ReleaseWithArtist,
} from "@/types/types";
import styles from "./AddToEntityListView.module.css";
import formStyles from "../forms.module.css";
import EntityCard from "./EntityCard";

type ItemFrom = ArtistWithReleases | ReleaseWithArtist;
type ItemTo = Group | Collection;

type AddToEntityListViewProps = {
  from: "Artist" | "Release";
  to: "Group" | "Collection";
  itemsFrom: ItemFrom[];
  itemsTo: ItemTo[];
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
};

export default function AddToEntityListView({
  from,
  to,
  itemsFrom,
  itemsTo,
  onSubmit,
  onCancel,
}: AddToEntityListViewProps) {
  return (
    <div className={styles.view}>
      <div className={formStyles.container}>
        <h2>
          Add {from}s to {to}
        </h2>
        <ul className={styles.entityList}>
          {itemsFrom.map((item) => (
            <li key={item.id}>
              <EntityCard item={item} />
            </li>
          ))}
        </ul>
        <form onSubmit={onSubmit} className={formStyles.form}>
          <label className={formStyles.label}>
            Choose existing {to}
            <select name={to.toLowerCase()} className={formStyles.select}>
              {itemsTo?.map(({ id, title }) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <label className={formStyles.label}>
            Or add to a new {to}
            <input
              name="title"
              className={formStyles.input}
              placeholder={`Enter ${to} name`}
            />
          </label>
          <div className={formStyles.actions}>
            <button type="submit" className={formStyles.button}>
              Add
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
      </div>
    </div>
  );
}
