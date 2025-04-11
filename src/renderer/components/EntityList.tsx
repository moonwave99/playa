import Link from "./Link";
import cx from "clsx";
import styles from "./EntityList.module.css";
import { Artist, Collection, Group } from "@/types/types";

type EntityListProps = {
    items: (Artist | Collection | Group)[];
    label: string;
    useDarkText?: boolean;
};

export default function EntityList({
    items,
    label,
    useDarkText,
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
                    <li key={item.id}>{getLink(item)}</li>
                ))}
            </ul>
        </div>
    );
}
