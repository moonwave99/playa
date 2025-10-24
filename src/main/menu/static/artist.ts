import { MenuItem } from "electron";
import { ArtistWithReleasesFull } from "@/types/types";
import { openModal } from "@/main/controllers/init";
import { searchArtistOnDiscogs, searchArtistOnRYM } from "@/lib/external_links";
import { refreshMenuEntries, type GetMenuParams } from "../menu";

export function getArtistMenu({ controllers, stateManager }: GetMenuParams) {
  const { getSelectedArtist, getSelectedArtists, deleteArtists } =
    controllers.artist;

  const menuTemplate = [
    {
      id: "revealArtistInFinder",
      label: "Reveal Artist in Finder",
      accelerator: "Cmd+Shift+F",
      click: async () =>
        controllers.system.revealEntityInFinder(
          "Artist",
          stateManager.getSelection("artist").at(0)
        ),
    },
    {
      id: "refreshArtistReleases",
      disableOnImport: true,
      label: "Refresh all Releases content",
      accelerator: "Cmd+Shift+A",
      click: async () =>
        controllers.importFolders.refreshArtistReleases(
          (await getSelectedArtist(
            stateManager.getSelection("artist")
          )) as ArtistWithReleasesFull
        ),
    },
    {
      id: "importMissingCovers",
      label: "Import missing covers",
      accelerator: "Cmd+Shift+C",
      click: async () =>
        controllers.release.importMissingCovers(
          (await getSelectedArtist(stateManager.getSelection("artist")))
            .releases
        ),
    },
    {
      id: "editCurrentArtist",
      showOnSinglePage: true,
      label: "Edit current Artist",
      accelerator: "Cmd+Shift+E",
      click: async () =>
        openModal("editArtist", {
          artist: await getSelectedArtist(stateManager.getSelection("artist")),
        }),
    },
    {
      id: "editSelectedArtist",
      hideOnSinglePage: true,
      label: "Edit selected Artist",
      accelerator: "Shift+E",
      click: async () =>
        openModal("editArtist", {
          artist: await getSelectedArtist(stateManager.getSelection("artist")),
        }),
    },
    {
      id: "deleteSelectedArtists",
      allowMultiple: true,
      hideOnSinglePage: true,
      label: "Delete selected Artists",
      accelerator: "Backspace",
      click: async () => deleteArtists(stateManager.getSelection("artist")),
    },
    {
      id: "deleteCurrentArtist",
      showOnSinglePage: true,
      accelerator: "Cmd+Backspace",
      label: "Delete current Artist",
      click: async () => deleteArtists(stateManager.getSelection("artist")),
    },
    { type: "separator" as const },
    {
      id: "searchArtistOnDiscogs",
      label: "Search Artist on Discogs",
      accelerator: "Cmd+Shift+D",
      click: async () =>
        searchArtistOnDiscogs(
          await getSelectedArtist(stateManager.getSelection("artist"))
        ),
    },
    {
      id: "searchArtistOnRYM",
      label: "Search Artist on RYM",
      accelerator: "Shift+R",
      click: async () =>
        searchArtistOnRYM(
          await getSelectedArtist(stateManager.getSelection("artist"))
        ),
    },
    { type: "separator" as const },
    {
      id: "addArtistsToGroup",
      allowMultiple: true,
      label: "Add Artists to Group",
      accelerator: "Shift+A",
      click: async () =>
        openModal("addArtistsToGroup", {
          artists: await getSelectedArtists(
            stateManager.getSelection("artist")
          ),
        }),
    },
  ];

  const menu = new MenuItem({
    id: "artist",
    label: "Artist",
    submenu: menuTemplate,
  });

  function refresh() {
    const isSinglePage = stateManager.isPage("artist");
    refreshMenuEntries({
      menu,
      entries: menuTemplate,
      selectionLength: stateManager.getSelection("artist").length,
      isSinglePage,
      ...stateManager.getState(),
    });

    const isSingleGroupPage = stateManager.isPage("group");

    const deleteSelectedArtistEntry = menu.submenu.getMenuItemById(
      "deleteSelectedArtists"
    );

    if (isSingleGroupPage) {
      deleteSelectedArtistEntry.enabled = false;
    }
  }

  return {
    menu,
    refresh,
  };
}
