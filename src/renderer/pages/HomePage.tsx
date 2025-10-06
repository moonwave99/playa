import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { getReleaseContextMenuParams } from "@/lib/utils";
import {
  ReleaseWithArtistAndTracksAndSubreleases,
  HasId,
  ReleaseWithArtistAndSubReleases,
  Release,
} from "@/types/types";
import api from "../api";
import useStore from "../store";
import { withPrevent } from "../hooks/useKeyboardManager";
import { releaseColumnsConfig } from "../hooks/useResponsiveColumns";
import useReleases from "../query/useReleases";
import useArtists from "../query/useArtists";
import useGroups from "../query/useGroups";
import useCollections from "../query/useCollections";
import { getReleaseLink } from "@/lib/links";

import ErrorView from "../components/ErrorView";
import List from "../components/List";
import Link from "../components/Link";
import Loading from "../components/Loading";
import ListCard, { type Item } from "../components/ListCard";
import ReleaseView from "../components/ReleaseView";
import StatsView from "../components/StatsView";

import { Icon } from "../icons";
import { capitalize } from "lodash";
import cx from "clsx";
import styles from "./Page.module.css";
import homepageStyles from "./HomePage.module.css";
import formStyles from "../forms.module.css";

const pageSize = 5;

export default function HomePage() {
  const collectionData = useCollections({ pageSize });
  const artistData = useArtists({ pageSize });
  const groupData = useGroups({ pageSize });

  return (
    <div className={styles.page} data-testid="HomePage">
      <LatestReleasesView />
      <div className={homepageStyles.wrapper}>
        <LatestEntriesView
          entity="artist"
          {...artistData}
          entries={artistData.artists}
        />
        <LatestEntriesView
          entity="collection"
          {...collectionData}
          entries={collectionData.collections}
        />
        <LatestEntriesView
          entity="group"
          {...groupData}
          entries={groupData.groups}
        />
      </div>
      <StatsView />
    </div>
  );
}

type LatestReleasesViewProps = {
  count?: number;
};

function LatestReleasesView({ count = 5 }: LatestReleasesViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setModalContents } = useStore();
  const { isPending, error, releases } = useReleases({ pageSize: count });

  if (isPending) {
    return <Loading className={homepageStyles.latestReleasesLoader} />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  function onEnter(
    release: ReleaseWithArtistAndSubReleases,
    event: KeyboardEvent
  ) {
    if (event.metaKey) {
      api.system.playback({ release_id: release.id });
      return;
    }
    navigate(getReleaseLink(release));
  }

  const keyHandlers = {
    " ": withPrevent((_event: KeyboardEvent, selection: Release[]) => {
      setModalContents({
        name: "lightbox",
        params: {
          release: selection[0],
          context: releases,
        },
      });
    }),
  };

  return (
    <section className={cx(styles.section, homepageStyles.latestReleases)}>
      <header className={homepageStyles.header}>
        <h1>
          <Icon isFor="release" />
          {t("pages.HomePage.latest", { entity: "Releases " })}
        </h1>
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
        <List
          shouldPreventSpace
          items={releases}
          className={homepageStyles.releaseList}
          columnsConfig={releaseColumnsConfig}
          onEnter={onEnter}
          keyHandlers={keyHandlers}
          paddingEnd={0}
          render={({ item, selection, ...rest }) => (
            <ReleaseView
              {...rest}
              release={item as ReleaseWithArtistAndTracksAndSubreleases}
              onContextMenu={() =>
                api.menu.release(
                  ...getReleaseContextMenuParams({
                    selection: selection.map((index) => releases[index]),
                    target_id: (item as HasId).id,
                    context: { releases },
                  })
                )
              }
            />
          )}
        />
      )}
    </section>
  );
}

type LatestEntriesViewProps<T extends Item> = {
  entity: "artist" | "collection" | "group";
  isPending: boolean;
  error: Error;
  entries: T[];
};

function LatestEntriesView<T extends Item>({
  isPending,
  error,
  entity,
  entries,
}: LatestEntriesViewProps<T>) {
  const { t } = useTranslation();

  if (isPending) {
    return <Loading className={homepageStyles.entityListSectionLoader} />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <section className={homepageStyles.entityListSection}>
      <header className={homepageStyles.header}>
        <h3>
          <Icon isFor={entity} />
          {t("pages.HomePage.latest", { entity: `${capitalize(entity)}s` })}
        </h3>
        <Link
          className={cx(formStyles.button, formStyles.primary)}
          to={`/${entity}s`}
        >
          See All
        </Link>
      </header>
      {!entries?.length ? (
        <div className={styles.placeholder}>
          {t("placeholders.emptyList", { entity: `${capitalize(entity)}s` })}
        </div>
      ) : (
        <ul className={homepageStyles.entityList}>
          {entries.map((x) => (
            <li key={x.id}>
              <ListCard item={x} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
