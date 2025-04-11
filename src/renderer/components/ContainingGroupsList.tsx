import useArtist from "../query/useArtist";
import EntityList from "./EntityList";
import styles from "./EntityList.module.css";

type ContainingGroupsListProps = {
    id: number;
    useDarkText?: boolean;
    prependSeparator?: boolean;
};

export default function ContainingGroupsList({
    id,
    useDarkText,
    prependSeparator,
}: ContainingGroupsListProps) {
    const { artist } = useArtist(id);
    if (!artist?.groups.length) {
        return null;
    }
    return (
        <>
            {prependSeparator && <span className={styles.separator} />}
            <EntityList
                items={artist.groups}
                label="Appears in:"
                useDarkText={useDarkText}
            />
        </>
    );
}
