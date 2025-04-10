import useRelease from "../query/useRelease";
import EntityList from "./EntityList";

type ContainingCollectionsListProps = {
    id: number;
    useDarkText?: boolean;
};

export default function ContainingCollectionsList({
    id,
    useDarkText,
}: ContainingCollectionsListProps) {
    const { release } = useRelease(id);
    if (!release?.collections.length) {
        return null;
    }
    return (
        <EntityList
            items={release.collections}
            label="Appears in:"
            useDarkText={useDarkText}
        />
    );
}
