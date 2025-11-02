import { ArtistWithReleases, ReleaseWithArtist } from "@/types/types";
import EntityCard from "./EntityCard";
import styles from "./EntityCardList.module.css";

type EntityCardListProps<T> = {
  items: T[];
  onRemoveEntityClick?: (item: T) => void;
  getRemoveButtonLabel?: (item: T) => string;
};

export default function EntityCardList<
  T extends ArtistWithReleases | ReleaseWithArtist,
>({
  items,
  onRemoveEntityClick,
  getRemoveButtonLabel,
}: EntityCardListProps<T>) {
  return (
    <div className={styles.view}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <EntityCard
              item={item}
              removeButtonLabel={
                getRemoveButtonLabel ? getRemoveButtonLabel(item) : null
              }
              onRemoveEntityClick={() => onRemoveEntityClick(item)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
