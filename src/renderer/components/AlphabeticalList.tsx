import type { Artist, Release } from "@/types/types";
import Link from "./Link";
import styles from "./AlphabeticalList.module.css";
import { getArtistLink, getReleaseLink } from "@/lib/links";
import { groupItemsByLetter } from "@/lib/utils";

type Item = Artist | Release;

type AlphabeticalListProps = {
  items: Item[];
};

export default function AlphabeticalList({ items }: AlphabeticalListProps) {
  const groupedItems = groupItemsByLetter(items);

  function renderEntry(item: Item) {
    if (item.entityType === "Artist") {
      return <Link to={getArtistLink(item)}>{item.name}</Link>;
    }

    return <Link to={getReleaseLink(item)}>{item.title}</Link>;
  }

  function onLetterClick(letter: string) {
    const target = document.querySelector(`[data-letter="${letter}"]`);
    target?.scrollIntoView();
  }

  return (
    <div className={styles.view}>
      <LettersView onClick={onLetterClick} />
      <div className={styles.list}>
        {Object.entries(groupedItems).flatMap(
          ([letter, entries]: [string, Item[]]) => (
            <article key={letter} data-letter={letter}>
              <h3>{letter}</h3>
              <ul>
                {entries.map((entry) => (
                  <li key={entry.id}>{renderEntry(entry)}</li>
                ))}
              </ul>
            </article>
          )
        )}
      </div>
    </div>
  );
}

const letters = "#abcdefghijklmnopqrstuvwxyz".split("");

type LettersViewProps = {
  onClick: (letter: string) => void;
};

function LettersView({ onClick }: LettersViewProps) {
  return (
    <div className={styles.letters}>
      {letters.map((x) => (
        <button key={x} onClick={() => onClick(x)}>
          {x}
        </button>
      ))}
    </div>
  );
}
