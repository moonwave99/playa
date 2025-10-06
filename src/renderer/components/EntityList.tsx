import Link from "./Link";
import { Artist, Collection, Group } from "@/types/types";
import { MdRemoveCircle } from "react-icons/md";
import cx from "clsx";
import styles from "./EntityList.module.css";
import buttonStyles from "../buttons.module.css";
import { normalizeArtistDisplayName } from "@/lib/utils";

type EntityListProps = {
  items: (Artist | Collection | Group)[];
  label?: string;
  useDarkText?: boolean;
  className?: string;
  canDeleteFirstEntry?: boolean;
  onDelete?: (id: number) => void;
  onLinkClick?: () => void;
};

export default function EntityList({
  items,
  label,
  useDarkText,
  className,
  canDeleteFirstEntry = true,
  onDelete,
  onLinkClick,
}: EntityListProps) {
  function getLink(item: Artist | Collection | Group) {
    if (item.entityType === "Artist") {
      return (
        <Link
          className={cx(className || styles.link)}
          title={`[${item.id}]`}
          to={`/artists/${item.id}`}
          onClick={onLinkClick}
        >
          {normalizeArtistDisplayName(item.name)}
        </Link>
      );
    }
    return (
      <Link
        className={cx(className || styles.link)}
        title={`[${item.id}]`}
        to={`/${item.entityType.toLowerCase()}s/${item.id}`}
        onClick={onLinkClick}
      >
        {item.title}
      </Link>
    );
  }

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
            {getLink(item)}
            {showDeleteButton(index) && (
              <button
                className={cx(
                  buttonStyles.CornerActionButton,
                  buttonStyles.mini,
                  styles.CornerActionButton
                )}
                onClick={() => onDelete(item.id)}
                aria-label={`Remove entry ${item.id} from list`}
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
