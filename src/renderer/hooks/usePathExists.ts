import { useState, useEffect } from "react";
import { Release } from "@/types/types";
import api from "../api";
import useStore from "../store";

const pathCache: Record<string, boolean> = {};

type UsePathExists = {
  exists: boolean | null;
  openRelocateFolderModal: () => void;
};

export default function usePathExists(release: Release): UsePathExists {
  const [exists, setExists] = useState(null);
  const { setModalContents } = useStore();

  useEffect(() => {
    if (!release || pathCache[release.path]) {
      return;
    }
    api.system.pathExists(release.path).then((value) => {
      pathCache[release.path] = value;
      setExists(value);
    });
    return () => {
      pathCache[release.path] = null;
    };
  }, [release]);

  function openRelocateFolderModal() {
    setModalContents({
      name: "missingReleaseFolder",
      params: { release },
    });
  }

  return {
    exists,
    openRelocateFolderModal,
  };
}
