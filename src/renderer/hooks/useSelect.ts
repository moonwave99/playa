import { useEffect } from "react";
import { SelectableEntities } from "@/types/types";
import api from "../api";

type Select = (
  selection: number[],
  options?: {
    clearOther: boolean;
  }
) => void;

export type UseSelect = {
  select: Select;
};

export function useSelect(
  entity: SelectableEntities,
  initialSelection?: number[]
): UseSelect {
  const select = (
    selection: number[],
    options?: {
      clearOther: boolean;
    }
  ) => api.state.setSelection(entity, selection, options);

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
