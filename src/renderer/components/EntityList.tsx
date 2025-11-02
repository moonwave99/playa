import { useTranslation } from "react-i18next";
import Link from "./Link";
import { Artist, Collection, Group, HasId, Release } from "@/types/types";
import { normalizeArtistDisplayName } from "@/lib/utils";
import { getEntityLink } from "@/lib/links";

import { Icon } from "../icons";
import cx from "clsx";
import styles from "./EntityList.module.css";

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
  linkClassName?: string;
  canDeleteFirstEntry?: boolean;
  onDelete?: (id: number) => void;
  onLinkClick?: () => void;
  i18nkey?: string;
  textOnly?: boolean;
};

function getTitle(item: ContextItem) {
  return item.entityType === "artist"
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
  linkClassName,
  canDeleteFirstEntry = true,
  onDelete,
  onLinkClick,
  i18nkey = "entityList.actions.delete.default",
  textOnly,
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
          <li
            key={item.id}
            className={cx(styles.item, itemClassName, {
              [styles.textOnly]: textOnly,
            })}
          >
            <Link
              className={cx(styles.link, linkClassName)}
              title={`[${item.id}]`}
              to={getEntityLink(item)}
              onClick={onLinkClick}
            >
              {getTitle(item)}
            </Link>
            {showDeleteButton(index) && (
              <button
                className={cx(styles.removeButton)}
                onClick={() => onDelete(item.id)}
                aria-label={t(i18nkey, {
                  item: getTitle(item),
                  context: getTitle(context),
                })}
              >
                <Icon isFor="actions.delete" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
