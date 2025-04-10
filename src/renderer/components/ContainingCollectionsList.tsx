import useRelease from "../query/useRelease";
import EntityList from "./EntityList";
import styles from "./EntityList.module.css";

type ContainingCollectionsListProps = {
    id: number;
    useDarkText?: boolean;
    prependSeparator?: boolean;
};

export default function ContainingCollectionsList({
    id,
    useDarkText,
    prependSeparator,
}: ContainingCollectionsListProps) {
    const { release } = useRelease(id);
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
            />
        </>
    );
}
