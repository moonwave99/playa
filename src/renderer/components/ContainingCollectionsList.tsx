import useRelease from "../query/useRelease";
import EntityList from "./EntityList";
import styles from "./EntityList.module.css";

type ContainingCollectionsListProps = {
  id: number;
  useDarkText?: boolean;
  prependSeparator?: boolean;
  onLinkClick?: () => void;
};

export default function ContainingCollectionsList({
  id,
  useDarkText,
  prependSeparator,
  onLinkClick,
}: ContainingCollectionsListProps) {
  const { release, removeFromCollection } = useRelease({ id });
  if (!release?.collections.length) {
    return null;
  }
  return (
    <>
      {prependSeparator && <span className={styles.separator} />}
      <EntityList
        items={release.collections}
        label="Appears in:"
        useDarkText={useDarkText}
        onDelete={removeFromCollection}
        onLinkClick={onLinkClick}
      />
    </>
  );
}
