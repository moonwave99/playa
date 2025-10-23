import { MenuItem } from "electron";
import { ArtistWithReleasesFull } from "@/types/types";
import { openModal } from "@/main/controllers/init";
import { searchArtistOnDiscogs, searchArtistOnRYM } from "@/lib/external_links";
import { type GetMenuParams } from "../menu";

export function getArtistMenu({ controllers, stateManager }: GetMenuParams) {
  const { getSelectedArtist, getSelectedArtists, deleteArtists } =
    controllers.artist;

  const menu = new MenuItem({
    id: "artist",
    label: "Artist",
    submenu: [
      {
        label: "Reveal Artist in Finder",
        accelerator: "Cmd+Shift+F",
        click: async () =>
          controllers.system.revealEntityInFinder(
            "Artist",
            stateManager.getSelection("artist").at(0)
          ),
      },
      {
        label: "Refresh all Releases content",
        accelerator: "Cmd+Shift+A",
        id: "refresh-releases",
        click: async () =>
          controllers.importFolders.refreshArtistReleases(
            (await getSelectedArtist(
              stateManager.getSelection("artist")
            )) as ArtistWithReleasesFull
          ),
      },
      {
        label: "Import missing covers",
        accelerator: "Cmd+Shift+C",
        click: async () =>
          controllers.release.importMissingCovers(
            (await getSelectedArtist(stateManager.getSelection("artist")))
              .releases
          ),
      },
      {
        id: "editArtist",
        label: "Edit Artist",
        accelerator: "Shift+E",
        click: async () =>
          openModal("editArtist", {
            artist: await getSelectedArtist(
              stateManager.getSelection("artist")
            ),
          }),
      },
      {
        id: "deleteArtists",
        accelerator: "Backspace",
        label: "Delete Artist(s)",
        click: async () => deleteArtists(stateManager.getSelection("artist")),
      },
      { type: "separator" },
      {
        label: "Search Artist on Discogs",
        accelerator: "Cmd+Shift+D",
        click: async () =>
          searchArtistOnDiscogs(
            await getSelectedArtist(stateManager.getSelection("artist"))
          ),
      },
      {
        label: "Search Artist on RYM",
        accelerator: "Shift+R",
        click: async () =>
          searchArtistOnRYM(
            await getSelectedArtist(stateManager.getSelection("artist"))
          ),
      },
      { type: "separator" },
      {
        label: "Add Artist(s) to Group",
        id: "addArtistsToGroup",
        accelerator: "Shift+A",
        click: async () =>
          openModal("addArtistsToGroup", {
            artists: await getSelectedArtists(
              stateManager.getSelection("artist")
            ),
          }),
      },
    ],
  });

  function refresh() {
    const { isInputFocused, isImporting } = stateManager.getState();
    const selectionLength = stateManager.getSelection("artist").length;

    menu.submenu.items.forEach((item) => {
      if (isInputFocused) {
        item.enabled = false;
        return;
      }

      if (selectionLength > 1) {
        item.enabled = ["addArtistsToGroup", "deleteArtists"].includes(item.id);
        return;
      }

      if (selectionLength === 1) {
        item.enabled = ["refresh-releases"].includes(item.id)
          ? !isImporting
          : true;
        return;
      }

      item.enabled = false;
    });
  }

  return { menu, refresh };
}
