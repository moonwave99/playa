import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef
} from 'react';

import Mousetrap from 'mousetrap';
import { chunk, without, groupBy as groupItemsBy, isEqual } from 'lodash';
import { usePrevious } from 'react-delta';

export const EMPTY_CELL = 'USE_GRID_EMPTY_CELL';
export enum Directions {
  Up,
  Down,
  Left,
  Right
}

type ListenerEvent = MouseEvent & {
  target: Element;
};

export type GridCell = {
  _id: string;
  firstOfGroup?: boolean;
  group?: string;
};

export type Threshold = {
  width: number;
  columns: number;
};

type OnItemClickParams = {
  _id: string;
  metaKey: boolean;
  shiftKey: boolean;
};

type GenerateRowsParams<T> = {
  items: GridCell[];
  thresholds: Threshold[];
  groupBy?: (item: T) => string;
  windowWidth: number;
}

export function generateRows<T>({
  items,
  thresholds,
  groupBy,
  windowWidth
}: GenerateRowsParams<T & GridCell>): {
  rows: GridCell[][];
  threshold: Threshold;
} {
  let threshold = thresholds[thresholds.length - 1];
  for (let i = 0; i < thresholds.length; i++ ) {
    if (windowWidth > thresholds[i].width) {
      threshold = thresholds[i];
      break;
    }
  }

  function padRow(row: GridCell[]): void {
    if (!row) {
      return;
    }
    const padding = threshold.columns - row.length;
    for (let i = 0; i < padding; i++) {
      row.push({ _id: EMPTY_CELL });
    }
  }

  if (groupBy) {
    const groupedItems = groupItemsBy(items, groupBy);
    const rows = Object.entries(groupedItems).reduce((memo, [group, value]) => {
      const rows = [...chunk(value.map(x => ({ ...x, group })), threshold.columns)];
      rows[0][0].firstOfGroup = true;
      padRow(rows[rows.length - 1]);
      return [...memo, ...rows];
    }, []);
    return {
      rows,
      threshold
    };
  }

  const rows = [...chunk(items, threshold.columns)];
  padRow(rows[rows.length - 1]);

  return {
    rows,
    threshold
  };
}

export function moveSelection({
  items,
  selection,
  rows,
  direction
}: {
  items: GridCell[];
  selection: GridCell['_id'][];
  rows: GridCell[][];
  direction: Directions;
}): number {
  if (selection.length === 0 && items.length > 0) {
    return 0;
  }

  function changeRow(direction: Directions.Down|Directions.Up): number {
    const [limit, increment] = direction === Directions.Up
      ? [0, -1] : [rows.length - 1, 1];
    const rowIndex = rows.findIndex(
      row => row.find(({ _id }) => _id === selection[0])
    );
    if (rowIndex === limit) {
      return items.findIndex(({ _id }) => _id === selection[0]);
    }
    const colIndex = rows[rowIndex].findIndex(({ _id }) => _id === selection[0]);
    const targetRow = rows[rowIndex + increment];
    const { _id: targetCellId } = targetRow[colIndex];
    if (targetCellId === EMPTY_CELL) {
      let currentColIndex = colIndex;
      while (targetRow[currentColIndex]._id === EMPTY_CELL) {
        currentColIndex--;
      }
      return items.findIndex(({ _id }) => _id === targetRow[currentColIndex]._id);
    } else {
      return items.findIndex(({ _id }) => _id === targetCellId);
    }
  }

  switch (direction) {
    case Directions.Up:
    case Directions.Down:
      return changeRow(direction);
    case Directions.Right:
      return Math.min(
        items.findIndex(
          ({ _id }) => _id === selection[0]
        ) + 1,
        items.length - 1
      );
    case Directions.Left:
      return Math.max(
        items.findIndex(
          ({ _id }) => _id === selection[0]
        ) - 1,
        0
      );
  }
}

export enum KeyboardDirections {
  Horizontal,
  Vertical,
  Both
}

type UseGridParams<T> = {
  items: GridCell[];
  thresholds?: Threshold[];
  direction?: KeyboardDirections;
  excludeClass?: string;
  interactive?: boolean;
  clearSelectionOnBlur?: boolean;
  initialSelection?: GridCell['_id'][];
  groupBy?: (item: T) => string;
  onEnter?: (selection: GridCell['_id'][]) => void;
  onBackspace?: (selection: GridCell['_id'][]) => void;
}

export default function useGrid<T>({
  items = [],
  thresholds = [{
    width: 0,
    columns: 1
  }],
  direction = KeyboardDirections.Both,
  excludeClass = '',
  interactive = true,
  clearSelectionOnBlur = false,
  initialSelection = [],
  groupBy,
  onEnter,
  onBackspace
}: UseGridParams<T>): {
  rows: GridCell[][];
  selection: GridCell['_id'][];
  threshold: Threshold;
  onItemClick: (params: OnItemClickParams) => void;
  setFocus: (focus: boolean) => void;
  selectItem: (selectedID: GridCell['_id']) => void;
  grid: (node?: Element | null) => void;
} {
  const hasFocus = useRef(false);
  const [selection, setSelection] = useState(initialSelection);
  const [rows, setRows] = useState([] as GridCell[][]);
  const [threshold, setThreshold] = useState(thresholds[0]);

  const ref = useRef(null);

  const listener = (event: ListenerEvent): void => {
    if (!ref || !ref.current) {
      return;
    }
    if (!ref.current.contains(event.target) || !event.target.classList.contains(excludeClass)) {
      hasFocus.current = false;
      clearSelectionOnBlur && setSelection([]);
    }
  };

  const setRef = useCallback(node => {
    if (ref.current) {
      document.removeEventListener('click', listener);
    }
    if (node) {
      document.addEventListener('click', listener);
    }
    ref.current = node
  }, [items, listener]);

  function recompute(): void {
    const { rows: computedRows, threshold } = generateRows<T>({
      items,
      thresholds,
      groupBy,
      windowWidth: window.innerWidth
    });
    setRows(computedRows);
    setThreshold(threshold);
  }

  const previousItems = usePrevious(items);

  useEffect(() => {
    if (isEqual(previousItems, items)) {
      return;
    }
    recompute();
  }, [items]);

  useLayoutEffect(() => {
    window.addEventListener('resize', recompute);
    return (): void => window.removeEventListener('resize', recompute);
  }, [items]);

  useEffect(() => {
    if (!interactive) {
      return;
    }
    function onUp(event: KeyboardEvent): void {
      event.preventDefault()
      event.stopPropagation();
      if (!hasFocus.current) {
        return;
      }
      const newIndex = moveSelection({
        items,
        selection,
        rows,
        direction: Directions.Up
      });
      setSelection([items[newIndex]._id]);
    }

    function onDown(event: KeyboardEvent): void {
      event.preventDefault()
      event.stopPropagation();
      if (!hasFocus.current) {
        return;
      }
      const newIndex = moveSelection({
        items,
        selection,
        rows,
        direction: Directions.Down
      });
      setSelection([items[newIndex]._id]);
    }

    function onLeft(): void {
      if (!hasFocus.current) {
        return;
      }
      const newIndex = moveSelection({
        items,
        selection,
        rows,
        direction: Directions.Left
      });
      setSelection([items[newIndex]._id]);
    }

    function onRight(): void {
      if (!hasFocus.current) {
        return;
      }
      const newIndex = moveSelection({
        items,
        selection,
        rows,
        direction: Directions.Right
      });
      setSelection([items[newIndex]._id]);
    }

    function _onEnter(): void {
      if (!hasFocus.current) {
        return;
      }
      onEnter && onEnter(selection);
    }

    function _onBackspace(): void {
      if (!hasFocus.current) {
        return;
      }
      onBackspace && onBackspace(selection);
    }

    function onAll(): void {
      if (!hasFocus.current) {
        return;
      }
      setSelection(items.map(({ _id }) => _id));
    }

    const mousetrap = new Mousetrap();

    if (direction === KeyboardDirections.Both || direction === KeyboardDirections.Vertical) {
      mousetrap.bind('up', onUp);
      mousetrap.bind('down', onDown);
    }

    if (direction === KeyboardDirections.Both || direction === KeyboardDirections.Horizontal) {
      mousetrap.bind('left', onLeft);
      mousetrap.bind('right', onRight);
    }
    mousetrap.bind('enter', _onEnter);
    mousetrap.bind('backspace', _onBackspace);
    mousetrap.bind('command+a', onAll);

    return (): void => {
      mousetrap.unbind(['up', 'down', 'left', 'right', 'enter', 'backspace', 'command+a']);
    };
  }, [items, rows, selection]);

  function onItemClick({ _id, metaKey }: OnItemClickParams): void {
    if (!interactive) {
      return;
    }
    hasFocus.current = true;
    if (metaKey) {
      if (selection.indexOf(_id) > -1){
        setSelection(without(selection, _id));
      } else {
        setSelection([...selection, _id]);
      }
      return;
    }
    setSelection([_id]);
  }

  function setFocus(focus: boolean): void {
    hasFocus.current = focus;
  }

  function selectItem(selectedID: GridCell['_id']): void {
    if (items.find(({ _id }) => _id === selectedID)) {
      setSelection([selectedID]);
    }
  }

  return {
    rows,
    selection,
    threshold,
    onItemClick,
    setFocus,
    selectItem,
    grid: setRef
  };
}
