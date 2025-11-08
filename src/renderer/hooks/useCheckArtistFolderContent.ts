// useCheckArtistFolderContent

import { useState, useEffect } from "react";
import { Artist } from "@/types/types";
import api from "../api";
import useStore from "../store";

const artistCache: Record<string, boolean> = {};

type UseCheckArtistFolderContent = {
  commonMissingPath: string;
  openRelocateFolderModal: () => void;
};

export default function useCheckArtistFolderContent(
  artist: Artist
): UseCheckArtistFolderContent {
  const [commonMissingPath, setCommonMissingPath] = useState(null);
  const { setModalContents } = useStore();

  useEffect(() => {
    if (!artist || artistCache[artist.id]) {
      return;
    }
    api.artist.checkArtistFolderContents(artist.id).then((commonPath) => {
      if (!commonPath) {
        artistCache[artist.id] = true;
        setCommonMissingPath(null);
        return;
      }
      artistCache[artist.id] = false;
      setCommonMissingPath(commonPath);
    });

    return () => {
      artistCache[artist.id] = null;
    };
  }, [artist]);

  function openRelocateFolderModal() {
    setModalContents({
      name: "missingArtistFolder",
      params: { artist, commonMissingPath },
    });
  }

  return {
    commonMissingPath,
    openRelocateFolderModal,
  };
}
