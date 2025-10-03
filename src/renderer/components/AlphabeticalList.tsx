import type { Artist, Release } from "@/types/types";
import useRestoreListPosition from "../hooks/useRestoreListPosition";
import List from "./List";
import Link from "./Link";
import { getArtistLink, getReleaseLink } from "@/lib/links";
import styles from "./AlphabeticalList.module.css";

type Item = Artist | Release;

type AlphabeticalListProps = {
  items: [string, Item[]][];
};

export default function AlphabeticalList({ items }: AlphabeticalListProps) {
  const { scrollInfo, storeScrollInfo, ref } = useRestoreListPosition({
    key: ["artistList"],
  });

  function renderEntry(item: Item) {
    if (item.entityType === "Artist") {
      return <Link to={getArtistLink(item)}>{item.name}</Link>;
    }
    return <Link to={getReleaseLink(item)}>{item.title}</Link>;
  }

  const letters = items.map((x) => x[0]);

  return (
    <div className={styles.view}>
      <div className={styles.letters}>
        {letters.map((x, index) => (
          <button key={x} onClick={() => ref.current.scrollToIndex(index)}>
            {x}
          </button>
        ))}
      </div>
      <List
        ref={ref}
        className={styles.list}
        items={items}
        overscan={1}
        onUnmount={storeScrollInfo}
        columnsConfig={[{ count: 1, width: 400 }]}
        estimateSize={(_, index: number) => ({
          width: "100%",
          height: (Math.floor(items[index][1].length / 5) + 3) * 24,
        })}
        render={({ item }) => (
          <article key={item[0]} data-letter={item[0]}>
            <h3>
              {item[0]} <span className={styles.count}>({item[1].length})</span>
            </h3>
            <ul>
              {item[1].map((entry) => (
                <li key={entry.id}>{renderEntry(entry)}</li>
              ))}
            </ul>
          </article>
        )}
        scrollBehavior={{
          align: "start",
        }}
        scrollInfo={scrollInfo}
      />
    </div>
  );
}
