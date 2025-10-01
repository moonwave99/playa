import { ArtistWithReleases, ReleaseWithArtist } from "@/types/types";
import EntityCard from "./EntityCard";
import styles from "./EntityCardList.module.css";

type EntityCardListProps<T> = {
  items: T[];
  onRemoveEntityClick?: (item: T) => void;
};

export default function EntityCardList<
  T extends ArtistWithReleases | ReleaseWithArtist,
>({ items, onRemoveEntityClick }: EntityCardListProps<T>) {
  return (
    <div className={styles.view}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <EntityCard
              item={item}
              onRemoveEntityClick={() => onRemoveEntityClick(item)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
