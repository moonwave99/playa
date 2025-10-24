import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getReleaseContextMenuParams } from "@/lib/utils";
import {
  ReleaseWithArtistAndTracksAndSubreleases,
  HasId,
  ReleaseWithArtistAndSubReleases,
  HasEntityType,
} from "@/types/types";
import api from "../api";
import { useSelect, type UseSelect } from "../hooks/useSelect";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";
import { releaseColumnsConfig } from "../hooks/useResponsiveColumns";
import useReleases from "../query/useReleases";
import useArtists from "../query/useArtists";
import useGroups from "../query/useGroups";
import useCollections from "../query/useCollections";

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
import { useReleaseLightbox } from "../hooks/useReleaseLightbox";

const pageSize = 5;

export default function HomePage() {
  const releasesData = useReleases({ pageSize });
  const artistData = useArtists({ pageSize });
  const collectionData = useCollections({ pageSize });
  const groupData = useGroups({ pageSize });
  const { select: selectRelease } = useSelect("release");

  const dataMap = {
    artist: artistData.artists,
    collection: collectionData.collections,
    group: groupData.groups,
  };

  const { currentSelection, onReleaseDown, select } = useNavigateHomepage({
    dataMap,
    onListsUp: () => {
      selectRelease([releasesData.releases.at(0).id], { clearOther: true });
      document
        .getElementById("LatestReleasesView")
        .scrollIntoView({ block: "nearest" });
    },
  });

  const { section, index } = currentSelection;

  return (
    <div className={styles.page} data-testid="HomePage">
      <LatestReleasesView
        {...releasesData}
        onDown={onReleaseDown}
        onReleaseSelect={(release) => {
          select({ section: null, index: -1 });
          selectRelease([release.id], { clearOther: true });
        }}
      />
      <div className={homepageStyles.wrapper}>
        <LatestEntriesView
          entity="artist"
          {...artistData}
          entries={artistData.artists}
          selectedIndex={section === "artist" ? index : -1}
          onEntryClick={(index) =>
            select({
              index,
              section: "artist",
            })
          }
        />
        <LatestEntriesView
          entity="collection"
          {...collectionData}
          entries={collectionData.collections}
          selectedIndex={section === "collection" ? index : -1}
          onEntryClick={(index) =>
            select({
              index,
              section: "collection",
            })
          }
        />
        <LatestEntriesView
          entity="group"
          {...collectionData}
          entries={groupData.groups}
          selectedIndex={section === "group" ? index : -1}
          onEntryClick={(index) =>
            select({
              index,
              section: "group",
            })
          }
        />
      </div>
      <StatsView />
    </div>
  );
}

type LatestReleasesViewProps = {
  count?: number;
  isPending: boolean;
  error: Error;
  releases: ReleaseWithArtistAndSubReleases[];
  onDown: () => void;
  onReleaseSelect: (item: HasId) => void;
};

function LatestReleasesView({
  releases,
  isPending,
  error,
  onDown,
  onReleaseSelect,
}: LatestReleasesViewProps) {
  const { t } = useTranslation();
  const openLightbox = useReleaseLightbox({ context: releases });

  if (isPending) {
    return <Loading className={homepageStyles.latestReleasesLoader} />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <section
      className={cx(styles.section, homepageStyles.latestReleases)}
      id="LatestReleasesView"
    >
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
          disableMultipleSelection
          items={releases}
          className={homepageStyles.releaseList}
          columnsConfig={releaseColumnsConfig}
          keyHandlers={{
            ArrowDown: withPrevent(onDown),
            " ": openLightbox,
          }}
          paddingEnd={0}
          testId="LatestReleases"
          onSelect={onReleaseSelect}
          render={({ item, selection, ...rest }) => (
            <ReleaseView
              {...rest}
              release={item as ReleaseWithArtistAndTracksAndSubreleases}
              onContextMenu={() =>
                api.menu.release(
                  ...getReleaseContextMenuParams({
                    selection: selection.map((index) => releases[index]),
                    target_id: (item as HasId).id,
                    context: { releases, entityType: null },
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
  selectedIndex: number;
  isPending: boolean;
  error: Error;
  entries: T[];
  onEntryClick: (index: number) => void;
};

function LatestEntriesView<T extends Item>({
  entity,
  selectedIndex = -1,
  isPending,
  error,
  entries,
  onEntryClick,
}: LatestEntriesViewProps<T>) {
  const { t } = useTranslation();

  if (isPending) {
    return <Loading className={homepageStyles.entityListSectionLoader} />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  function onContextMenu(item: T) {
    if (item.entityType === "Artist") {
      api.menu.artist(item);
    }
    if (item.entityType === "Collection") {
      api.menu.collection(item);
    }
    if (item.entityType === "Group") {
      api.menu.group(item);
    }
  }

  const formattedEntity = `${capitalize(entity)}s`;

  return (
    <section
      className={homepageStyles.entityListSection}
      data-testid={`Latest${formattedEntity}`}
    >
      <header className={homepageStyles.header}>
        <h3>
          <Icon isFor={entity} />
          {t("pages.HomePage.latest", { entity: formattedEntity })}
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
          {t("placeholders.emptyList", { entity: formattedEntity })}
        </div>
      ) : (
        <ul className={homepageStyles.entityList}>
          {entries.map((x, index) => (
            <li key={x.id} data-id={`item-${entity}-${index}`}>
              <ListCard
                onContextMenu={() => onContextMenu(x)}
                hasFocus={selectedIndex === index}
                selected={selectedIndex === index}
                item={x}
                onClick={() => onEntryClick(index)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type Selection = {
  section: "artist" | "collection" | "group";
  index: number;
};

type UseNavigateHomepageParams = {
  context?: string;
  onListsUp: () => void;
  dataMap: Record<Selection["section"], (HasId & HasEntityType)[]>;
};

type UseNavigateHomepage = {
  onReleaseDown: () => void;
  currentSelection: Selection;
  select: (selection: Selection) => void;
};

const horizontalSections = ["artist", "collection", "group"] as const;

function useNavigateHomepage({
  context = "home",
  onListsUp,
  dataMap,
}: UseNavigateHomepageParams): UseNavigateHomepage {
  const [currentSelection, setCurrentSelection] = useState<Selection>({
    section: null,
    index: -1,
  });

  useEffect(() => {
    document
      .querySelector(
        `[data-id="item-${currentSelection.section}-${currentSelection.index}"]`
      )
      ?.scrollIntoView({
        block: "nearest",
      });
  }, [currentSelection]);

  const { section, index } = currentSelection;

  const { setContext } = useKeyManager({
    context,
    handlers: {
      ArrowUp: withPrevent(() => {
        if (index === 0) {
          setContext("list");
          setCurrentSelection({
            section: null,
            index: -1,
          });
          onListsUp();
          return;
        }
        setCurrentSelection((prev) => ({ ...prev, index: prev.index - 1 }));
      }),
      ArrowDown: withPrevent(() =>
        setCurrentSelection((prev) => ({
          ...prev,
          index: Math.min(prev.index + 1, dataMap[section]?.length - 1),
        }))
      ),
      ArrowRight: () =>
        setCurrentSelection((prev) => {
          if (!prev.section) {
            return prev;
          }
          const sectionIndex = horizontalSections.indexOf(prev.section);
          if (sectionIndex === horizontalSections.length - 1) {
            return prev;
          }
          return {
            index: 0,
            section: horizontalSections[sectionIndex + 1],
          };
        }),
      ArrowLeft: () =>
        setCurrentSelection((prev) => {
          if (!prev.section) {
            return prev;
          }
          const sectionIndex = horizontalSections.indexOf(prev.section);
          if (sectionIndex === 0) {
            return prev;
          }
          return {
            index: 0,
            section: horizontalSections[sectionIndex - 1],
          };
        }),
    },
  });

  useEffect(() => {
    if (!currentSelection.section) {
      return;
    }
    const { section, index } = currentSelection;
    selectMap[section]([dataMap[section][index].id], {
      clearOther: true,
    });
  }, [currentSelection]);

  useEffect(() => {
    setContext("list");
    return () => setContext("list");
  }, []);

  const { select: selectArtist } = useSelect("artist");
  const { select: selectCollection } = useSelect("collection");
  const { select: selectGroup } = useSelect("group");

  const selectMap: Record<Selection["section"], UseSelect["select"]> = {
    artist: selectArtist,
    collection: selectCollection,
    group: selectGroup,
  };

  function onReleaseDown() {
    setContext(context);
    setCurrentSelection({
      section: horizontalSections[0],
      index: 0,
    });
  }

  function select(selection: Selection) {
    setContext(selection.section !== null ? context : "list");
    setCurrentSelection(selection);
  }

  return {
    onReleaseDown,
    currentSelection,
    select,
  };
}
