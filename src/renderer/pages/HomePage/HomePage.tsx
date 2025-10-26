import { useEffect, useState } from "react";
import { HasEntityTypeAndId, Release } from "@/types/types";
import { useSelect, type UseSelect } from "@/renderer/hooks/useSelect";
import {
  useKeyManager,
  withPrevent,
} from "@/renderer/hooks/useKeyboardManager";
import { useReleaseLightbox } from "@/renderer/hooks/useReleaseLightbox";
import useReleases from "@/renderer/query/useReleases";
import useArtists from "@/renderer/query/useArtists";
import useGroups from "@/renderer/query/useGroups";
import useCollections from "@/renderer/query/useCollections";

import LatestReleasesView from "./LatestReleasesView";
import LatestEntriesView from "./LatestEntriesView";

import styles from "../Page.module.css";
import homepageStyles from "./HomePage.module.css";

import {
  HOMEPAGE_RELEASES_PAGESIZE,
  HOMEPAGE_ENTRIES_PAGESIZE,
} from "@/constants";

const pageSize = HOMEPAGE_ENTRIES_PAGESIZE;

export default function HomePage() {
  const releasesData = useReleases({ pageSize: HOMEPAGE_RELEASES_PAGESIZE });
  const artistData = useArtists({ pageSize });
  const collectionData = useCollections({ pageSize });
  const groupData = useGroups({ pageSize });

  const dataMap = {
    release: releasesData.releases,
    artist: artistData.artists,
    collection: collectionData.collections,
    group: groupData.groups,
  };

  const { currentSelection, select } = useNavigateHomepage({
    dataMap,
  });

  const { section, index } = currentSelection;

  return (
    <div className={styles.page} data-testid="HomePage">
      <LatestReleasesView
        {...releasesData}
        selectedIndex={section === "release" ? index : -1}
        onEntryClick={(index) => {
          select({ section: "release", index });
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
    </div>
  );
}

type Selection = {
  section: "release" | "artist" | "collection" | "group";
  index: number;
};

type UseNavigateHomepageParams = {
  context?: string;
  dataMap: Record<Selection["section"], HasEntityTypeAndId[]>;
};

type UseNavigateHomepage = {
  currentSelection: Selection;
  select: (selection: Selection) => void;
};

function useNavigateHomepage({
  context = "list",
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

  const sections = Object.keys(dataMap) as unknown as (keyof typeof dataMap)[];

  const openLightbox = useReleaseLightbox({
    context: dataMap.release as unknown as Release[],
  });

  function isFirstPopulatedSection() {
    const horizontalSections = sections.slice(1);
    const firstPopulatedIndex = horizontalSections.findIndex(
      (x) => !!dataMap[x].length
    );
    const currentSectionIndex = horizontalSections.findIndex(
      (x) => x === section
    );
    return firstPopulatedIndex === currentSectionIndex;
  }

  function getNextPopulatedSection() {
    const currentIndex = sections.indexOf(section);
    if (currentIndex === sections.length - 1) {
      return null;
    }
    for (let i = currentIndex + 1; i < sections.length; i++) {
      if (dataMap[sections[i]].length) {
        return sections[i];
      }
    }
  }

  function getPrevPopulatedSection() {
    const currentIndex = sections.indexOf(section);
    if (currentIndex === 0) {
      return null;
    }
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (dataMap[sections[i]].length) {
        return sections[i];
      }
    }
  }

  useKeyManager({
    context,
    handlers: {
      " ": withPrevent(() => {
        if (section !== "release" || index === -1) {
          return;
        }
        openLightbox([dataMap.release[index]]);
      }),
      ArrowUp: withPrevent(() => {
        if (section === "release") {
          return;
        }
        if (index > 0) {
          setCurrentSelection((prev) => ({
            ...prev,
            index: prev.index - 1,
          }));
          return;
        }
        if (isFirstPopulatedSection()) {
          setCurrentSelection({ section: "release", index: 0 });
          return;
        }
        const prev = getPrevPopulatedSection();
        if (!prev) {
          return;
        }
        setCurrentSelection({
          section: prev,
          index: dataMap[prev].length - 1,
        });
      }),
      ArrowDown: withPrevent(() => {
        if (section === "release") {
          const next = getNextPopulatedSection();
          if (!next) {
            return;
          }
          setCurrentSelection({ section: next, index: 0 });
          return;
        }
        if (index < dataMap[section]?.length - 1) {
          setCurrentSelection((prev) => ({
            ...prev,
            index: prev.index + 1,
          }));
          return;
        }
        const next = getNextPopulatedSection();
        if (!next) {
          return;
        }
        setCurrentSelection({ section: next, index: 0 });
      }),
      ArrowRight: withPrevent(() => {
        if (section === "release") {
          if (index < dataMap.release.length - 1) {
            setCurrentSelection((prev) => ({
              ...prev,
              index: prev.index + 1,
            }));
            return;
          }
          const next = getNextPopulatedSection();
          if (!next) {
            return;
          }
          setCurrentSelection({ section: next, index: 0 });
          return;
        }
        const next = getNextPopulatedSection();
        if (!next) {
          return;
        }
        setCurrentSelection({ section: next, index: 0 });
      }),
      ArrowLeft: withPrevent(() => {
        if (section === "release") {
          setCurrentSelection((prev) => ({
            ...prev,
            index: Math.max(0, prev.index - 1),
          }));
          return;
        }
        const prev = getPrevPopulatedSection();
        if (!prev) {
          return;
        }
        setCurrentSelection({
          section: prev,
          index: 0,
        });
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

  const { select: selectRelease } = useSelect("release");
  const { select: selectArtist } = useSelect("artist");
  const { select: selectCollection } = useSelect("collection");
  const { select: selectGroup } = useSelect("group");

  const selectMap: Record<Selection["section"], UseSelect["select"]> = {
    release: selectRelease,
    artist: selectArtist,
    collection: selectCollection,
    group: selectGroup,
  };

  return {
    currentSelection,
    select: setCurrentSelection,
  };
}
