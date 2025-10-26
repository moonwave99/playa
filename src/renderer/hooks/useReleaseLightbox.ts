import { Release, HasId } from "@/types/types";
import useStore from "../store";

type UseReleaseLightboxParams = {
  context: Release[];
};

export function useReleaseLightbox({ context }: UseReleaseLightboxParams) {
  const { setModalContents } = useStore();
  return (selection: HasId[]) => {
    setModalContents({
      name: "lightbox",
      params: {
        release: selection[0],
        context,
      },
    });
  };
}
