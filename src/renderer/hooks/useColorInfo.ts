import { useEffect } from "react";
import { getColorInfo } from "@/lib/utils";
import { ReleaseWithArtistAndSubReleases } from "@/types/types";
import useStore from "../store";

export default function useColorInfo(
  coverRelease: ReleaseWithArtistAndSubReleases
) {
  const { settings, setUseDarkText } = useStore();
  const { darkText, color } = getColorInfo(
    coverRelease,
    settings.USE_RAINBOW_MODE
  );
  useEffect(() => {
    setUseDarkText(darkText);
    return () => setUseDarkText(false);
  }, [darkText]);

  return { darkText, color };
}
