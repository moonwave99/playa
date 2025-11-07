import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import type {
  Group,
  Collection,
  ArtistWithReleases,
  ReleaseWithArtist,
} from "@/types/types";

import EntityCard from "./EntityCard";
import LookupView from "./Lookup/LookupView";

import styles from "./AddToEntityListView.module.css";
import formStyles from "../forms.module.css";

type ItemFrom = ArtistWithReleases | ReleaseWithArtist;
type ItemTo = Group | Collection;

type AddToEntityListViewProps = {
  from: "Artist" | "Release";
  to: "Group" | "Collection";
  itemsFrom: ItemFrom[];
  itemsTo: ItemTo[];
  autoFocus?: boolean;
  onSubmit: (itemTo: ItemTo) => void;
  onCancel: () => void;
};

export default function AddToEntityListView({
  from,
  to,
  itemsFrom,
  itemsTo,
  autoFocus,
  onSubmit,
  onCancel,
}: AddToEntityListViewProps) {
  const { t } = useTranslation();
  const [itemTo, setItemTo] = useState(null);
  const [query, setQuery] = useState("");

  function _onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!itemTo) {
      return;
    }
    onSubmit(itemTo);
  }

  return (
    <div className={styles.view}>
      <div className={formStyles.container}>
        <h2>{t("modals.AddToEntityListView.title", { from, to })}</h2>
        <ul className={styles.entityList}>
          {itemsFrom.map((item) => (
            <li key={item.id}>
              <EntityCard item={item} />
            </li>
          ))}
        </ul>
        <form onSubmit={_onSubmit} className={formStyles.form}>
          <label className={formStyles.label}>
            {t("modals.AddToEntityListView.label", { to })}
            <LookupView
              className={styles.lookup}
              query={query}
              onQueryChange={setQuery}
              value={itemTo}
              items={itemsTo}
              onChange={setItemTo}
              allowCustomValue
              fixedList
              autoFocus={autoFocus}
              getText={(item) => item?.title}
              getCustomValue={(title) => ({ id: null as number, title })}
            />
          </label>
          <div className={formStyles.actions}>
            <button type="submit" className={formStyles.button}>
              {t("modals.AddToEntityListView.actions.add")}
            </button>
            <button
              type="button"
              className={formStyles.button}
              onClick={onCancel}
            >
              {t("modals.AddToEntityListView.actions.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
