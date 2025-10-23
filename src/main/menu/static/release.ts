import { MenuItem } from "electron";
import {
  ReleaseWithArtistAndTracks,
  ReleaseWithArtist,
  SelectableEntities,
} from "@/types/types";
import { openModal } from "@/main/controllers/init";
import {
  searchReleaseOnDiscogs,
  searchReleaseOnRYM,
} from "@/lib/external_links";
import { type GetMenuParams } from "../menu";

export function getReleaseMenu({ controllers, stateManager }: GetMenuParams) {
  const { getRelease, getSelectedReleases, unGroupSelectedRelease } =
    controllers.release;
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

    return (await getSelectedReleases(stateManager.getSelection("release"))).at(
      0
    );
  }

  function getDeleteContext() {
    for (const entityType of ["Artist", "Collection"] as const) {
      if (stateManager.isPage(entityType.toLowerCase())) {
        return {
          entityType,
          id: stateManager
            .getSelection(entityType.toLowerCase() as SelectableEntities)
            .at(0),
        };
      }
    }
    return null;
  }

  const menu = new MenuItem({
    id: "release",
    label: "Release",
    submenu: [
      {
        id: "showReleaseInLightbox",
        label: "Show Release in Lightbox",
        accelerator: "Space",
        click: async () => {
          const release = await getRelease(
            stateManager.getSelection("release").at(0)
          );
          openModal("lightbox", {
            release,
            context: await getReleaseContext(),
          });
        },
      },
      {
        label: "Open Release in Tagger",
        accelerator: "Shift+T",
        click: () =>
          controllers.system.openTagger(
            stateManager.getSelection("release").at(0)
          ),
      },
      {
        label: "Reveal Release in Finder",
        accelerator: "Shift+F",
        click: () =>
          controllers.system.revealEntityInFinder(
            "Release",
            stateManager.getSelection("release").at(0)
          ),
      },
      {
        label: "Refresh Folder Contents",
        accelerator: "Cmd+Shift+R",
        click: () =>
          controllers.importFolders.refreshReleaseContents(
            stateManager.getSelection("release").at(0)
          ),
      },
      {
        label: "Search Release Cover",
        accelerator: "Shift+C",
        click: async () =>
          controllers.release.importCovers(
            (await getSelectedReleases(
              stateManager.getSelection("release")
            )) as ReleaseWithArtistAndTracks[]
          ),
      },
      { type: "separator" },
      {
        label: "Search Release on Discogs",
        accelerator: "Shift+D",
        click: async () =>
          searchReleaseOnDiscogs(
            (await getRelease(
              stateManager.getSelection("release").at(0)
            )) as ReleaseWithArtist
          ),
      },
      {
        label: "Search Release on RYM",
        accelerator: "Shift+R",
        click: async () =>
          searchReleaseOnRYM(
            (await getRelease(
              stateManager.getSelection("release").at(0)
            )) as ReleaseWithArtist
          ),
      },
      {
        id: "editRelease",
        label: `Edit Release`,
        accelerator: "Cmd+Shift+E",
        click: async () =>
          openModal("editRelease", {
            release: (
              await getSelectedReleases(stateManager.getSelection("release"))
            ).at(0),
          }),
      },
      {
        id: "groupReleases",
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
        label: `Ungroup selected Release`,
        accelerator: "Cmd+Shift+G",
        visible: false,
        click: unGroupSelectedRelease,
      },
      {
        id: "deleteReleases",
        label: "Delete selected Releases",
        accelerator: "Backspace",
        click: async () =>
          controllers.release.deleteReleases(
            stateManager.getSelection("release"),
            getDeleteContext()
          ),
      },
      {
        id: "addReleasesToCollection",
        label: `Add selected Releases to Collection`,
        accelerator: "a",
        click: async () =>
          openModal("addReleasesToCollection", {
            releases: await getSelectedReleases(
              stateManager.getSelection("release")
            ),
          }),
      },
    ],
  });

  async function refresh() {
    const isSingleReleasePage = stateManager.isPage("release");
    const isSingleCollectionePage = stateManager.isPage("collection");
    const { isInputFocused } = stateManager.getState();

    const selectedReleasesIds = stateManager.getSelection("release");

    menu.submenu.items.forEach((item) => {
      if (isInputFocused) {
        item.enabled = false;
        return;
      }

      item.enabled = selectedReleasesIds.length === 1;
      if (["addReleasesToCollection", "deleteReleases"].includes(item.id)) {
        item.enabled = selectedReleasesIds.length > 0;
      }

      if (item.id === "showReleaseInLightbox") {
        item.enabled = selectedReleasesIds.length === 1 && !isSingleReleasePage;
      }

      if (item.id === "deleteReleases") {
        item.enabled =
          !!selectedReleasesIds.length &&
          !isSingleReleasePage &&
          !isSingleCollectionePage;
      }
    });

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
