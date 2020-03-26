import { getURLfromItem, NativeDragItem } from './useNativeDrop';

describe('getURLfromItem', () => {
  it('should return an url from dropped item', () => {
    const urlFromUrl = getURLfromItem({
      urls: ['https://url/to/resource'],
    } as NativeDragItem);
    expect(urlFromUrl).toBe('https://url/to/resource');

    const urlFromFile = getURLfromItem({
      files: [{
        path: 'file://path/to/file'
      }],
    } as NativeDragItem);
    expect(urlFromFile).toBe('file://path/to/file');

    const urlFromFileFiltered = getURLfromItem({
      files: [{
        path: 'file://path/to/file.jpeg',
        type: 'image/jpeg'
      }],
    } as NativeDragItem, (type: string) => type.startsWith('image'));
    expect(urlFromFileFiltered).toBe('file://path/to/file.jpeg');

    expect(
      getURLfromItem({
        files: [{
          path: 'file://path/to/file.jpeg',
          type: 'text'
        }],
      } as NativeDragItem, (type: string) => type.startsWith('image'))
    ).toBe(null);
  });
});
