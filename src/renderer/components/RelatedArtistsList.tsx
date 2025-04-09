import Link from "./Link";
import useArtist from "../query/useArtist";
import cx from "clsx";
import styles from "./RelatedArtistsList.module.css";

type RelatedArtistsListProps = {
    id: number;
    useDarkText?: boolean;
};

export default function RelatedArtistsList({
    id,
    useDarkText,
}: RelatedArtistsListProps) {
    const { artist } = useArtist(id);
    if (!artist?.relatedArtists.length) {
        return null;
    }
    return (
        <div
            className={cx(styles.RelatedArtistsList, {
                [styles.useDarkText]: useDarkText,
            })}
        >
            Related Artists:
            <ul>
                {artist.relatedArtists.map(({ id, name }) => (
                    <li key={id}>
                        <Link title={`[${id}]`} to={`/artists/${id}`}>
                            {name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
