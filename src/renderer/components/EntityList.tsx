import Link from "./Link";
import { Artist, Collection, Group } from "@/types/types";
import { MdRemoveCircle } from "react-icons/md";
import cx from "clsx";
import styles from "./EntityList.module.css";
import buttonStyles from "../buttons.module.css";

type EntityListProps = {
    items: (Artist | Collection | Group)[];
    label: string;
    useDarkText?: boolean;
    onDelete?: (id: number) => void;
};

export default function EntityList({
    items,
    label,
    useDarkText,
    onDelete,
}: EntityListProps) {
    function getLink(item: Artist | Collection | Group) {
        if (item._type === "artist") {
            return (
                <Link title={`[${item.id}]`} to={`/artists/${item.id}`}>
                    {item.name}
                </Link>
            );
        }
        return (
            <Link title={`[${item.id}]`} to={`/${item._type}s/${item.id}`}>
                {item.title}
            </Link>
        );
    }
    return (
        <div
            className={cx(styles.EntityList, {
                [styles.useDarkText]: useDarkText,
            })}
        >
            {label}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {getLink(item)}
                        {onDelete && (
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
