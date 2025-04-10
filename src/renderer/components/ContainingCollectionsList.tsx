import useRelease from "../query/useRelease";
import EntityList from "./EntityList";

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
            {prependSeparator && <span>|</span>}
            <EntityList
                items={release.collections}
                label="Appears in:"
                useDarkText={useDarkText}
            />
        </>
    );
}
