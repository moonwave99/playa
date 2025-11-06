import { useState, useEffect } from "react";
import { Release } from "@/types/types";
import api from "../api";
import useStore from "../store";

const pathCache: Record<string, boolean> = {};

type UsePathExists = {
  exists: boolean;
  onMissingPathClick: () => void;
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
  }, [release]);

  function onMissingPathClick() {
    setModalContents({
      name: "missingReleaseFolder",
      params: { release },
    });
  }

  return {
    exists,
    onMissingPathClick,
  };
}
