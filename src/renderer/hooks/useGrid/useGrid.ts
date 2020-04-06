import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef
} from 'react';

import Mousetrap from 'mousetrap';
import { chunk, without, groupBy as groupItemsBy } from 'lodash';

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

export type HasId = {
  _id: string;
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

type GenerateRowsParams = {
  items: HasId[];
  thresholds: Threshold[];
  groupBy?: string;
  windowWidth: number;
}

export function generateRows({
  items,
  thresholds,
  groupBy,
  windowWidth
}: GenerateRowsParams): {
  rows: HasId[][];
  threshold: Threshold;
} {
  let threshold = thresholds[thresholds.length - 1];
  for (let i = 0; i < thresholds.length; i++ ) {
    if (windowWidth > thresholds[i].width) {
      threshold = thresholds[i];
      break;
    }
  }

  if (groupBy) {
    const groupedItems = groupItemsBy(items, groupBy);
    const rows = Object.entries(groupedItems).reduce((memo, [, value]) => {
      const rows = [...chunk(value, threshold.columns)];
      const lastRow = rows[rows.length - 1];
      const padding = threshold.columns - lastRow.length;
      for (let i = 0; i < padding; i++) {
        lastRow.push({ _id: EMPTY_CELL });
      }
      return [...memo, ...rows];
    }, []);
    return {
      rows,
      threshold
    };
  }

  return {
    rows: [...chunk(items, threshold.columns)],
    threshold
  };
}

export function moveSelection({
  items,
  selection,
  rows,
  direction
}: {
  items: HasId[];
  selection: string[];
  rows: HasId[][];
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

type UseGridParams = {
  items: HasId[];
  thresholds?: Threshold[];
  direction?: 'both'|'vertical'|'horizontal';
  excludeClass?: string;
  clearSelectionOnBlur?: boolean;
  initialSelection?: string[];
  groupBy?: string;
  onEnter?: Function;
  onBackspace?: Function;
}

export default function useGrid({
  items = [],
  thresholds = [{
    width: 0,
    columns: 1
  }],
  direction = 'both',
  excludeClass = '',
  clearSelectionOnBlur = false,
  initialSelection = [],
  groupBy,
  onEnter,
  onBackspace
}: UseGridParams): {
  rows: HasId[][];
  selection: string[];
  threshold: Threshold;
  onItemClick: Function;
  requestFocus: Function;
  selectItem: Function;
  grid: (node?: Element | null) => void;
} {
  const [hasFocus, setFocus] = useState(false);
  const [selection, setSelection] = useState(initialSelection);
  const [rows, setRows] = useState([] as HasId[][]);
  const [threshold, setThreshold] = useState(thresholds[0]);

  const ref = useRef(null);

  const listener = (event: ListenerEvent): void => {
    if (!ref || !ref.current) {
      return;
    }
    if (!ref.current.contains(event.target) || !event.target.classList.contains(excludeClass)) {
      setFocus(false);
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
    const { rows: computedRows, threshold } = generateRows({
      items,
      thresholds,
      groupBy,
      windowWidth: window.innerWidth
    });
    setRows(computedRows);
    setThreshold(threshold);
  }

  useEffect(() => {
    recompute();
  }, [items]);

  useLayoutEffect(() => {
    window.addEventListener('resize', recompute);
    return (): void => window.removeEventListener('resize', recompute);
  }, [items]);

  useEffect(() => {
    function onUp(event: KeyboardEvent): void {
      event.preventDefault()
      event.stopPropagation();
      if (!hasFocus) {
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
      if (!hasFocus) {
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
      if (!hasFocus) {
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
      if (!hasFocus) {
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
      if (!hasFocus) {
        return;
      }
      onEnter && onEnter(selection);
    }

    function _onBackspace(): void {
      if (!hasFocus) {
        return;
      }
      onBackspace && onBackspace(selection);
    }

    function onAll(): void {
      if (!hasFocus) {
        return;
      }
      setSelection(items.map(({ _id }) => _id));
    }

    const mousetrap = new Mousetrap();

    if (direction === 'both' || direction === 'vertical') {
      mousetrap.bind('up', onUp);
      mousetrap.bind('down', onDown);
    }

    if (direction === 'both' || direction === 'horizontal') {
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
    setFocus(true);
    if (metaKey) {
      if (selection.indexOf(_id) > -1){
        setSelection(without(selection, _id));
      } else {
        setSelection([...selection, _id]);
      }
      return;
    }
    setSelection([_id ]);
  }

  function requestFocus(): void {
    setFocus(true);
  }

  function selectItem(selectedID: HasId['_id']): void {
    if (items.find(({ _id }) => _id === selectedID)) {
      setSelection([selectedID]);
    }
  }

  return {
    rows,
    selection,
    threshold,
    onItemClick,
    requestFocus,
    selectItem,
    grid: setRef
  };
}
