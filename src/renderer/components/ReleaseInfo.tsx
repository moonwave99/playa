import { useTranslation } from "react-i18next";
import { getReleaseDuration, getDiscInfo } from "@/lib/utils";
import { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import cx from "clsx";
import styles from "./ReleaseInfo.module.css";

type ReleaseInfoProps = {
  release: ReleaseWithArtistAndTracksAndSubreleases;
  isSingle?: boolean;
  isInline?: boolean;
};

export default function ReleaseInfo({
  release,
  isSingle = false,
  isInline = true,
}: ReleaseInfoProps) {
  const { t } = useTranslation();
  const { type, year } = release;
  const { duration, trackCount } = getReleaseDuration(release);
  return (
    <div className={cx(styles.view, { [styles.isInline]: isInline })}>
      <span>
        {type}, {year} {getDiscInfo(release)}
        {isSingle && (
          <>
            <span className={styles.trackCount}>
              {t("components.ListCard.trackCount", { count: trackCount })}
            </span>
            <span
              className={cx(styles.releaseDuration, {
                [styles.releaseDurationBlock]: !isInline && isSingle,
              })}
            >
              {duration}
            </span>
          </>
        )}
      </span>
    </div>
  );
}
