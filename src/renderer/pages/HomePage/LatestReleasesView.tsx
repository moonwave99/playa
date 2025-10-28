import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ReleaseWithArtistAndSubReleases, HasId } from "@/types/types";
import { getReleaseContextMenuParams } from "@/lib/utils";
import api from "@/renderer/api";

import ReleaseView from "@/renderer/components/ReleaseView";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";

import { Icon } from "@/renderer/icons";
import cx from "clsx";
import styles from "./LatestReleasesView.module.css";
import formStyles from "@/renderer/forms.module.css";

type LatestReleasesViewProps = {
  count?: number;
  isPending: boolean;
  error: Error;
  releases: ReleaseWithArtistAndSubReleases[];
  onEntryClick: (index: number) => void;
  selectedIndex: number;
};

export default function LatestReleasesView({
  releases,
  selectedIndex,
  isPending,
  error,
  onEntryClick,
}: LatestReleasesViewProps) {
  const { t } = useTranslation();

  if (isPending) {
    return <Loading className={styles.loader} />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <section
      className={styles.view}
      data-testid="LatestReleases"
      id="LatestReleases"
    >
      <header className={styles.header}>
        <h2>
          <Icon isFor="release" />
          {t("pages.HomePage.latest", { entity: "Releases " })}
        </h2>
        <Link
          className={cx(formStyles.button, formStyles.primary)}
          to="/releases"
        >
          {t("pages.HomePage.seeAll")}
        </Link>
      </header>
      {!releases?.length ? (
        <div className={styles.placeholder}>
          {t("placeholders.emptyList", { entity: "Releases" })}
        </div>
      ) : (
        <div className={styles.listWrapper}>
          <ul className={styles.list}>
            {releases.map((release, index) => (
              <li key={release.id} data-id={`item-release-${index}`}>
                <ReleaseView
                  selected={index === selectedIndex}
                  hasFocus={index === selectedIndex}
                  onClick={() => onEntryClick(index)}
                  release={release}
                  onContextMenu={() =>
                    api.menu.release(
                      ...getReleaseContextMenuParams({
                        selection: [release],
                        target_id: (release as HasId).id,
                        context: { releases, entityType: null },
                      })
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
