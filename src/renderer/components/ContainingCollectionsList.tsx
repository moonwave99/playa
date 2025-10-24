import { useTranslation } from "react-i18next";
import useRelease from "../query/useRelease";
import EntityList, { type EntityListProps } from "./EntityList";
import styles from "./EntityList.module.css";

type ContainingCollectionsListProps = Pick<
  EntityListProps,
  "className" | "itemClassName" | "useDarkText"
> & {
  id: number;
  prependSeparator?: boolean;
  onLinkClick?: () => void;
};

export default function ContainingCollectionsList({
  id,
  prependSeparator,
  onLinkClick,
  ...rest
}: ContainingCollectionsListProps) {
  const { t } = useTranslation();
  const { release, removeFromCollection } = useRelease({ id });

  if (!release?.collections.length) {
    return null;
  }

  return (
    <>
      {prependSeparator && <span className={styles.separator} />}
      <EntityList
        i18nkey="entityList.actions.delete.containingCollections"
        context={release}
        items={release.collections}
        label={t("components.ContainingCollectionsList.label")}
        onDelete={removeFromCollection}
        onLinkClick={onLinkClick}
        {...rest}
      />
    </>
  );
}
