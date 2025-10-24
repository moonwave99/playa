import { useTranslation } from "react-i18next";
import useArtist from "../query/useArtist";
import EntityList, { type EntityListProps } from "./EntityList";
import styles from "./EntityList.module.css";

type ContainingGroupsListProps = Pick<
  EntityListProps,
  "className" | "itemClassName" | "useDarkText"
> & {
  id: number;
  prependSeparator?: boolean;
};

export default function ContainingGroupsList({
  id,
  prependSeparator,
  ...rest
}: ContainingGroupsListProps) {
  const { t } = useTranslation();
  const { artist, removeFromGroup } = useArtist(id);

  if (!artist?.groups.length) {
    return null;
  }

  return (
    <>
      {prependSeparator && <span className={styles.separator} />}
      <EntityList
        i18nkey="entityList.actions.delete.containingGroups"
        context={artist}
        items={artist.groups}
        label={t("components.ContainingGroupsList.label")}
        onDelete={removeFromGroup}
        {...rest}
      />
    </>
  );
}
