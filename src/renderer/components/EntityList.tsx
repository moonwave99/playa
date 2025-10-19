import { useTranslation } from "react-i18next";
import Link from "./Link";
import { Artist, Collection, Group, HasId, Release } from "@/types/types";
import { normalizeArtistDisplayName } from "@/lib/utils";
import { MdRemoveCircle } from "react-icons/md";
import cx from "clsx";
import styles from "./EntityList.module.css";
import buttonStyles from "../buttons.module.css";

type Item = HasId &
  (
    | Pick<Artist, "name" | "entityType">
    | Pick<Collection, "title" | "entityType">
    | Pick<Group, "title" | "entityType">
  );

type ContextItem = Item | Pick<Release, "title" | "entityType">;

export type EntityListProps = {
  items: Item[];
  context: ContextItem;
  label?: string;
  useDarkText?: boolean;
  className?: string;
  itemClassName?: string;
  canDeleteFirstEntry?: boolean;
  onDelete?: (id: number) => void;
  onLinkClick?: () => void;
  i18nkey?: string;
};

function getTitle(item: ContextItem) {
  return item.entityType === "Artist"
    ? normalizeArtistDisplayName(item.name)
    : item.title;
}

export default function EntityList({
  items,
  context,
  label,
  useDarkText,
  className,
  itemClassName,
  canDeleteFirstEntry = true,
  onDelete,
  onLinkClick,
  i18nkey = "entityList.actions.delete.default",
}: EntityListProps) {
  const { t } = useTranslation();
  function showDeleteButton(index: number) {
    if (!onDelete) {
      return false;
    }
    if (index >= 1) {
      return true;
    }
    return canDeleteFirstEntry;
  }

  return (
    <div
      className={cx(styles.EntityList, className, {
        [styles.useDarkText]: useDarkText,
      })}
    >
      {label}
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              className={cx(itemClassName || styles.link)}
              title={`[${item.id}]`}
              to={`/${item.entityType.toLowerCase()}s/${item.id}`}
              onClick={onLinkClick}
            >
              {getTitle(item)}
            </Link>
            {showDeleteButton(index) && (
              <button
                className={cx(
                  buttonStyles.CornerActionButton,
                  buttonStyles.mini,
                  styles.CornerActionButton
                )}
                onClick={() => onDelete(item.id)}
                aria-label={t(i18nkey, {
                  item: getTitle(item),
                  context: getTitle(context),
                })}
              >
                <MdRemoveCircle />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
