import {
  HasId,
  Threshold,
  Directions,
  generateRows,
  moveSelection
} from './useGrid';

import { ALBUM_GRID_THRESHOLDS } from '../../../constants';

type Item = HasId & { type?: string }

function generateItems(count = 0, type?: string): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    items.push({ _id: type ? `${type}_${i}` : `${i}`, type });
  }
  return items;
}

describe('generateRows', () => {
  it('should generate rows', () => {
    const items = generateItems(20);
    const thresholds = ALBUM_GRID_THRESHOLDS;

    thresholds.forEach(({ width, columns }: Threshold) => {
      const { rows, threshold } = generateRows({
        items,
        thresholds,
        windowWidth: width + 1
      });
      expect(threshold).toEqual({ width, columns });
      expect(rows.length).toBe(Math.ceil(items.length / columns));
    });
  });

  it('should generate rows grouped by item type', () => {
    const typeCounts = [4, 7, 11];
    const items = [
      ...generateItems(typeCounts[0], 'album'),
      ...generateItems(typeCounts[1], 'ep'),
      ...generateItems(typeCounts[2], 'single')
    ];
    const thresholds = ALBUM_GRID_THRESHOLDS;

    thresholds.forEach(({ width, columns }: Threshold) => {
      const { rows, threshold } = generateRows({
        items,
        thresholds,
        windowWidth: width + 1,
        groupBy: 'type'
      });

      expect(threshold).toEqual({ width, columns });

      const emptyCellCount = typeCounts.reduce(
        (memo, x) => memo + (columns - (x % columns)) % columns, 0
      );

      expect(rows.length).toBe((items.length + emptyCellCount) / columns);
    });
  });
});

describe('locateNextPosition', () => {
  describe('with raw items', () => {
    const items = generateItems(20);
    it('should select first item if selection is empty', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      expect(
        moveSelection({
          items,
          selection: [],
          rows,
          direction: Directions.Down
        })
      ).toBe(0);
    });

    it('should move to next row if direction is down', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      let count = 0;
      while (count < rows.length) {
        expect(
          moveSelection({
            items,
            selection: [items[count * rows[0].length]._id],
            rows,
            direction: Directions.Down
          })
        ).toBe(
          count === rows.length - 1
            ? count * rows[0].length
            : (count + 1) * rows[0].length
          );
        count++;
      }
    });

    it('should move to prev row if direction is up', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      let count = rows.length - 1;
      const offset = 3;
      while (count > 0) {
        expect(
          moveSelection({
            items,
            selection: [items[count * rows[0].length + offset]._id],
            rows,
            direction: Directions.Up
          })
        ).toBe(
          count === 0
            ? count * rows[0].length + offset
            : (count - 1) * rows[0].length + offset
          );
        count--;
      }
    });

    it('should move to next item in row if direction is right', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      let count = 0;
      while (count < items.length) {
        expect(
          moveSelection({
            items,
            selection: [items[count]._id],
            rows,
            direction: Directions.Right
          })
        ).toBe(
          count === items.length - 1 ? count : count + 1
        );
        count++;
      }
    });

    it('should move to prev item in row if direction is left', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      let count = items.length - 1;
      while (count > 0) {
        expect(
          moveSelection({
            items,
            selection: [items[count]._id],
            rows,
            direction: Directions.Left
          })
        ).toBe(
          count === 0 ? count : count - 1
        );
        count--;
      }
    });
  });

  describe('with grouped items', () => {
    const typeCounts = [4, 7, 11];
    const items = [
      ...generateItems(typeCounts[0], 'album'),
      ...generateItems(typeCounts[1], 'ep'),
      ...generateItems(typeCounts[2], 'single')
    ];
    it('should select first item if selection is empty', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      expect(
        moveSelection({
          items,
          selection: [],
          rows,
          direction: Directions.Down
        })
      ).toBe(0);
    });    
    it('should move to next row if direction is down', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401,
        groupBy: 'type'
      });

      expect(
        moveSelection({
          items,
          selection: [items[0]._id],
          rows,
          direction: Directions.Down
        })
      ).toBe(4);

      expect(
        moveSelection({
          items,
          selection: [items[4]._id],
          rows,
          direction: Directions.Down
        })
      ).toBe(11);

      expect(
        moveSelection({
          items,
          selection: [items[11]._id],
          rows,
          direction: Directions.Down
        })
      ).toBe(18);

      expect(
        moveSelection({
          items,
          selection: [items[18]._id],
          rows,
          direction: Directions.Down
        })
      ).toBe(18);
    });

    it('should move to prev row if direction is up', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401,
        groupBy: 'type'
      });

      expect(
        moveSelection({
          items,
          selection: [items[items.length - 1]._id],
          rows,
          direction: Directions.Up
        })
      ).toBe(14);

      expect(
        moveSelection({
          items,
          selection: [items[14]._id],
          rows,
          direction: Directions.Up
        })
      ).toBe(7);

      expect(
        moveSelection({
          items,
          selection: [items[7]._id],
          rows,
          direction: Directions.Up
        })
      ).toBe(3);
    });

    it('should move to next item in row if direction is right', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      let count = 0;
      while (count < items.length) {
        expect(
          moveSelection({
            items,
            selection: [items[count]._id],
            rows,
            direction: Directions.Right
          })
        ).toBe(
          count === items.length - 1 ? count : count + 1
        );
        count++;
      }
    });

    it('should move to prev item in row if direction is left', () => {
      const { rows } = generateRows({
        items,
        thresholds: ALBUM_GRID_THRESHOLDS,
        windowWidth: 1401
      });

      let count = items.length - 1;
      while (count > 0) {
        expect(
          moveSelection({
            items,
            selection: [items[count]._id],
            rows,
            direction: Directions.Left
          })
        ).toBe(
          count === 0 ? count : count - 1
        );
        count--;
      }
    });
  });
});
