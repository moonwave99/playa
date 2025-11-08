import { useTranslation } from "react-i18next";
import { getReleaseDuration, getDiscInfo } from "@/lib/utils";
import { ReleaseWithArtistAndTracksAndSubreleases } from "@/types/types";
import cx from "clsx";
import styles from "./ReleaseInfo.module.css";

type ReleaseInfoProps = {
  release: ReleaseWithArtistAndTracksAndSubreleases;
  className?: string;
  isSingle?: boolean;
  isInline?: boolean;
  useDarkText?: boolean;
};

export default function ReleaseInfo({
  release,
  className,
  isSingle = false,
  isInline = true,
  useDarkText = false,
}: ReleaseInfoProps) {
  const { t } = useTranslation();
  const { type, year } = release;
  const { duration, trackCount } = getReleaseDuration(release);
  return (
    <div
      className={cx(styles.view, className, {
        [styles.isInline]: isInline,
        [styles.useDarkText]: useDarkText,
      })}
    >
      <span>
        {type}, {year} {getDiscInfo(release)}
        {isSingle && trackCount ? (
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
        ) : null}
      </span>
    </div>
  );
}
