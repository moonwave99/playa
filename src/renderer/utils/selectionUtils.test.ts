import { select } from './selectionUtils';

describe('selectionUtils', () => {
  describe('select', () => {
    it('should deselect everything if index is -1', () => {
      const items = [
        { _id: '1', selected: true },
        { _id: '2', selected: true },
      ];
      expect(
        select({ items }).filter(({ selected }) => selected ).length
      ).toBe(0);
    });

    it('should select item at index', () => {
      const items = [
        { _id: '1', selected: false },
        { _id: '2', selected: false },
        { _id: '3', selected: false }
      ];
      expect(
        select({
          items,
          index: 0
        })
      ).toEqual([
        { _id: '1', selected: true },
        { _id: '2', selected: false },
        { _id: '3', selected: false }
      ]);
    });

    it('should be idempotent if no keys are passed', () => {
      let items = [
        { _id: '1', selected: false },
        { _id: '2', selected: false },
        { _id: '3', selected: false }
      ];
      items = select({
        items,
        index: 0
      });
      expect(
        select({
          items,
          index: 0
        })
      ).toEqual([
        { _id: '1', selected: true },
        { _id: '2', selected: false },
        { _id: '3', selected: false }
      ]);
    });

    it('should select item at index if unselected and metaKey is true', () => {
      const items = [
        { _id: '1', selected: true },
        { _id: '2', selected: false },
        { _id: '3', selected: false }
      ];
      expect(
        select({
          items,
          index: 2,
          metaKey: true
        })
      ).toEqual([
        { _id: '1', selected: true },
        { _id: '2', selected: false },
        { _id: '3', selected: true }
      ]);
    });

    it('should deselect item at index if item selected and metaKey is true', () => {
      const items = [
        { _id: '1', selected: true },
        { _id: '2', selected: false },
        { _id: '3', selected: true }
      ];
      expect(
        select({
          items,
          index: 2,
          metaKey: true
        })
      ).toEqual([
        { _id: '1', selected: true },
        { _id: '2', selected: false },
        { _id: '3', selected: false }
      ]);
    });

    it('should expand selection if shiftKey is true', () => {
      expect(
        select({
          items: [
            { _id: '1', selected: false },
            { _id: '2', selected: false },
            { _id: '3', selected: true },
            { _id: '4', selected: false },
            { _id: '5', selected: true }
          ],
          index: 0,
          shiftKey: true
        })
      ).toEqual([
        { _id: '1', selected: true },
        { _id: '2', selected: true },
        { _id: '3', selected: true },
        { _id: '4', selected: false },
        { _id: '5', selected: true }
      ]);

      expect(
        select({
          items: [
            { _id: '1', selected: true },
            { _id: '2', selected: false },
            { _id: '3', selected: true },
            { _id: '4', selected: false },
            { _id: '5', selected: false }
          ],
          index: 4,
          shiftKey: true
        })
      ).toEqual([
        { _id: '1', selected: true },
        { _id: '2', selected: false },
        { _id: '3', selected: true },
        { _id: '4', selected: true },
        { _id: '5', selected: true }
      ]);

      expect(
        select({
          items: [
            { _id: '1', selected: true },
            { _id: '2', selected: false },
            { _id: '3', selected: false },
            { _id: '4', selected: false },
            { _id: '5', selected: true }
          ],
          index: 2,
          shiftKey: true
        })
      ).toEqual([
        { _id: '1', selected: true },
        { _id: '2', selected: true },
        { _id: '3', selected: true },
        { _id: '4', selected: false },
        { _id: '5', selected: true }
      ]);
    });
  });
});
