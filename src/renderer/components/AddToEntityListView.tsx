import { useState, type FormEvent } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import type {
  Group,
  Collection,
  ArtistWithReleases,
  ReleaseWithArtist,
} from "@/types/types";
import { lowerCaseCompare } from "@/lib/utils";
import EntityCard from "./EntityCard";
import { IoChevronDownOutline } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import cx from "clsx";
import styles from "./AddToEntityListView.module.css";
import formStyles from "../forms.module.css";

type ItemFrom = ArtistWithReleases | ReleaseWithArtist;
type ItemTo = Group | Collection;

type AddToEntityListViewProps = {
  from: "Artist" | "Release";
  to: "Group" | "Collection";
  itemsFrom: ItemFrom[];
  itemsTo: ItemTo[];
  onSubmit: ({ title, itemTo }: { title?: string; itemTo?: ItemTo }) => void;
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
  const [itemTo, setItemTo] = useState(null);
  const [title, setTitle] = useState("");

  function _onSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      title,
      itemTo,
    });
  }

  function onItemChange(item: ItemTo) {
    setItemTo(item);
    setTitle("");
  }

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
        <form onSubmit={_onSubmit} className={formStyles.form}>
          <label className={formStyles.label}>
            Choose existing {to}
            <ItemsToList
              itemTo={itemTo}
              itemsList={itemsTo}
              onChange={onItemChange}
            />
          </label>
          <label className={formStyles.label}>
            Or add to a new {to}
            <input
              name="title"
              className={formStyles.input}
              placeholder={`Enter ${to} name`}
              value={title}
              onInput={(event: FormEvent) => {
                setTitle((event.target as HTMLInputElement).value);
                setItemTo(null);
              }}
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

type ItemsToListProps = {
  itemTo: ItemTo;
  itemsList: ItemTo[];
  onChange: (item: ItemTo) => void;
};

function ItemsToList({ itemTo, itemsList = [], onChange }: ItemsToListProps) {
  const [query, setQuery] = useState("");

  const results =
    query === ""
      ? itemsList
      : itemsList.filter(({ title }) => lowerCaseCompare(title, query));

  return (
    <div className={styles.ItemsToList}>
      <Combobox
        value={itemTo}
        by="id"
        onChange={onChange}
        onClose={() => setQuery("")}
      >
        <div className={styles.ItemsToListInputWrapper}>
          <ComboboxInput
            placeholder="Search for entry"
            className={styles.ItemsToListInput}
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(x: ItemTo) => x?.title}
          />
          <ComboboxButton className={styles.ItemsToListButton}>
            <IoChevronDownOutline />
          </ComboboxButton>
        </div>
        <ComboboxOptions className={styles.ItemsToListOptions}>
          {results.map((x) => (
            <ComboboxOption key={x.id} value={x}>
              {({ selected, active }) => (
                <span
                  className={cx(styles.ItemsToListOption, {
                    [styles.active]: active,
                  })}
                >
                  {x.title}
                  {selected && <IoMdCheckmark />}
                </span>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
