import { useLayoutEffect, useState } from "react";
import { throttle } from "lodash";

type UseResponsiveColumns = {
  columns: number;
};

export type ColumnsConfigEntry = {
  count: number;
  width: number;
};

type UseResponsiveColumnsParams = {
  config: ColumnsConfigEntry[];
  onResize?: () => void;
};

function getColumnCount(width: number, config: ColumnsConfigEntry[]) {
  for (const entry of config) {
    if (width > entry.width) {
      return entry.count;
    }
  }
  return 1;
}

export const releaseColumnsConfig = [
  { count: 9, width: 2800 },
  { count: 7, width: 1600 },
  { count: 5, width: 1100 },
  { count: 4, width: 768 },
  { count: 3, width: 600 },
  { count: 2, width: 400 },
];

export const compactColumnsConfig = [
  { count: 5, width: 2400 },
  { count: 4, width: 1600 },
  { count: 3, width: 900 },
  { count: 2, width: 600 },
];

export default function useResponsiveColumns({
  config,
  onResize,
}: UseResponsiveColumnsParams): UseResponsiveColumns {
  const [columns, setColumns] = useState(
    getColumnCount(window.innerWidth, config)
  );

  useLayoutEffect(() => {
    const _onResize = throttle(() => {
      setColumns(getColumnCount(window.innerWidth, config));
      if (onResize) {
        onResize();
      }
    }, 150);
    window.addEventListener("resize", _onResize);
    return () => window.removeEventListener("resize", _onResize);
  }, [config]);

  return {
    columns,
  };
}