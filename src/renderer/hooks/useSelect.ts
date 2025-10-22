import { useEffect } from "react";
import { SelectableEntities } from "@/types/types";
import api from "../api";

export function useSelect(
  entity: SelectableEntities,
  initialSelection?: number[]
) {
  const select = (selection: number[]) =>
    api.state.setSelection(entity, selection);

  useEffect(() => {
    if (initialSelection) {
      select(initialSelection);
    }
    return () => select([]);
  }, [initialSelection]);

  return {
    select,
  };
}
