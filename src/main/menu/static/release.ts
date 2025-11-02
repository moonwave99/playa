import { MenuItem } from "electron";
import { ReleaseWithArtistAndTracks } from "@/types/types";
import { send, openModal } from "@/main/controllers/init";
import {
  searchReleaseOnDiscogs,
  searchReleaseOnRYM,
  searchReleaseOnYouTube,
} from "@/lib/external_links";
import { refreshMenuEntries, type GetMenuParams } from "../menu";
import { getReleaseLink } from "@/lib/links";

export function getReleaseMenu({ controllers, stateManager }: GetMenuParams) {
  const {
    getRelease,
    getReleaseTitleInfo,
    getSelectedReleases,
    unGroupSelectedRelease,
  } = controllers.release;
  const { getCollection } = controllers.collection;
  const { getSelectedArtist } = controllers.artist;

  async function getReleaseContext() {
    if (stateManager.getSelection("collection").length) {
      return (
        await getCollection(stateManager.getSelection("collection").at(0))
      ).releases;
    }

    if (stateManager.getSelection("artist").length) {
      return (await getSelectedArtist(stateManager.getSelection("artist")))
        .releases;
    }

    return await getSelectedReleases(stateManager.getSelection("release"));
  }

  function getDeleteContext() {
    for (const entityType of ["artist", "collection"] as const) {
      if (stateManager.isPage(entityType)) {
        return {
          entityType,
          id: stateManager.getSelection(entityType).at(0),
        };
      }
    }
    return null;
  }

  const menuTemplate = [
    {
      id: "gotoReleasesPage",
      label: "Go to Releases",
      accelerator: "Cmd+2",
      isNavigationEntry: true,
      click: () => send("navigate", "/releases"),
    },
    {
      id: "gotoReleasePage",
      hideOnSinglePage: true,
      disableOnNavOpen: true,
      label: "Go to Release",
      accelerator: "Enter",
      click: () =>
        send(
          "navigate",
          getReleaseLink({ id: stateManager.getSelection("release").at(0) })
        ),
    },
    {
      id: "playbackCurrentRelease",
      label: "Playback Release",
      accelerator: "Cmd+Enter",
      click: () =>
        controllers.system.playback({
          release_id: stateManager.getSelection("release").at(0),
          track_id: stateManager.getSelection("track").at(0),
        }),
    },
    {
      id: "showReleaseInLightbox",
      hideOnSinglePage: true,
      label: "Show Release in Lightbox",
      accelerator: "Space",
      click: async () => {
        const release = await getRelease(
          stateManager.getSelection("release").at(0)
        );
        openModal("lightbox", {
          id: release.id,
          context: await getReleaseContext(),
        });
      },
    },
    {
      id: "openReleaseInTagger",
      label: "Open Release in Tagger",
      accelerator: "Shift+T",
      click: () =>
        controllers.system.openTagger(
          stateManager.getSelection("release").at(0)
        ),
    },
    {
      id: "revealReleaseInFinder",
      label: "Reveal Release in Finder",
      accelerator: "Shift+F",
      click: () =>
        controllers.system.revealEntityInFinder({
          entityType: "release",
          id: stateManager.getSelection("release").at(0),
        }),
    },
    {
      id: "refreshFolderContents",
      label: "Refresh Folder Contents",
      accelerator: "Cmd+Shift+R",
      click: () =>
        controllers.importFolders.refreshReleaseContents(
          stateManager.getSelection("release").at(0)
        ),
    },
    { type: "separator" as const },
    {
      id: "searchReleaseOnDiscogs",
      label: "Search Release on Discogs",
      accelerator: "Shift+D",
      click: async () =>
        searchReleaseOnDiscogs(
          await getReleaseTitleInfo(stateManager.getSelection("release").at(0))
        ),
    },
    {
      id: "searchReleaseOnRym",
      label: "Search Release on RateYourMusic",
      accelerator: "Shift+R",
      click: async () =>
        searchReleaseOnRYM(
          await getReleaseTitleInfo(stateManager.getSelection("release").at(0))
        ),
    },
    {
      id: "searchReleaseOnYouTube",
      label: "Search Release on YouTube",
      accelerator: "Shift+Y",
      click: async () =>
        searchReleaseOnYouTube(
          await getReleaseTitleInfo(stateManager.getSelection("release").at(0))
        ),
    },
    {
      id: "editSelectedRelease",
      hideOnSinglePage: true,
      label: `Edit selected Release`,
      accelerator: "Shift+E",
      click: () =>
        openModal("editRelease", {
          id: stateManager.getSelection("release").at(0),
        }),
    },
    {
      id: "editCurrentRelease",
      showOnSinglePage: true,
      label: `Edit current Release`,
      accelerator: "Cmd+Shift+E",
      click: async () =>
        openModal("editRelease", {
          id: stateManager.getSelection("release").at(0),
        }),
    },
    {
      id: "groupReleases",
      allowMultiple: true,
      label: `Group selected Releases`,
      accelerator: "Cmd+G",
      click: async () =>
        openModal("groupReleases", {
          releases: await getSelectedReleases(
            stateManager.getSelection("release")
          ),
        }),
    },
    {
      id: "unGroupRelease",
      label: "Ungroup selected Release",
      accelerator: "Cmd+Shift+G",
      visible: false,
      click: unGroupSelectedRelease,
    },
    {
      id: "deleteSelectedReleases",
      allowMultiple: true,
      hideOnSinglePage: true,
      label: "Delete selected Releases",
      accelerator: "Backspace",
      click: async () =>
        controllers.release.deleteReleases(
          stateManager.getSelection("release"),
          getDeleteContext()
        ),
    },
    {
      id: "deleteCurrentRelease",
      showOnSinglePage: true,
      label: "Delete current Release",
      accelerator: "Cmd+Backspace",
      click: async () =>
        controllers.release.deleteReleases(
          stateManager.getSelection("release"),
          getDeleteContext()
        ),
    },
    {
      id: "addCurrentReleaseToCollection",
      showOnSinglePage: true,
      label: `Add current Release to Collection`,
      accelerator: "Cmd+Shift+A",
      click: async () =>
        openModal("addReleasesToCollection", {
          releases: await getSelectedReleases(
            stateManager.getSelection("release")
          ),
        }),
    },
    {
      id: "addSelectedReleasesToCollection",
      hideOnSinglePage: true,
      allowMultiple: true,
      label: `Add selected Releases to Collection`,
      accelerator: "Shift+A",
      click: async () =>
        openModal("addReleasesToCollection", {
          releases: await getSelectedReleases(
            stateManager.getSelection("release")
          ),
        }),
    },
    { type: "separator" as const },
    {
      id: "searchReleaseCover",
      label: "Search Release Cover",
      accelerator: "Shift+C",
      click: async () =>
        controllers.release.importCovers(
          (await getSelectedReleases(
            stateManager.getSelection("release")
          )) as ReleaseWithArtistAndTracks[]
        ),
    },
    {
      id: "deleteReleaseCover",
      label: "Delete cover from selected Release",
      accelerator: "D",
      click: async () =>
        controllers.release.deleteCover(
          (await getSelectedReleases(stateManager.getSelection("release"))).at(
            0
          )
        ),
    },
  ];

  const menu = new MenuItem({
    id: "release",
    label: "Release",
    submenu: menuTemplate,
  });

  async function refresh() {
    const isSingleCollectionPage = stateManager.isPage("collection");
    const selectedReleasesIds = stateManager.getSelection("release");

    refreshMenuEntries({
      menu,
      entries: menuTemplate,
      selectionLength: selectedReleasesIds.length,
      isSinglePage: stateManager.isPage("release"),
      ...stateManager.getState(),
    });

    const deleteSelectedReleasesEntry = menu.submenu.getMenuItemById(
      "deleteSelectedReleases"
    );

    if (isSingleCollectionPage) {
      deleteSelectedReleasesEntry.enabled = false;
    }

    const groupReleasesEntry = menu.submenu.getMenuItemById("groupReleases");
    const unGroupReleasesEntry = menu.submenu.getMenuItemById("unGroupRelease");
    const selectedReleases = await getSelectedReleases(selectedReleasesIds);

    const isSomeReleaseMain = selectedReleases.some(
      (x) => x?.subReleases.length
    );

    if (isSomeReleaseMain) {
      if (selectedReleasesIds.length > 1) {
        groupReleasesEntry.visible = true;
        groupReleasesEntry.enabled = false;
        unGroupReleasesEntry.visible = false;
        unGroupReleasesEntry.enabled = false;
      } else if (selectedReleasesIds.length === 1) {
        groupReleasesEntry.visible = false;
        groupReleasesEntry.enabled = false;
        unGroupReleasesEntry.visible = true;
        unGroupReleasesEntry.enabled = true;
      }
      return;
    }
    unGroupReleasesEntry.visible = false;
    unGroupReleasesEntry.enabled = false;
    groupReleasesEntry.visible = true;
    groupReleasesEntry.enabled = selectedReleasesIds.length > 1;
  }

  return { menu, refresh };
}
