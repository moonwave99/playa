import * as React from 'react';
import { render } from 'enzyme';
import { tracks } from '../../../../../test/testFixtures';
import { ImportView } from './ImportView';

describe('ImportView tests', () => {
  it('should render an .import-view', () => {
    const wrapper = render(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    );
    expect(wrapper.is('.import-view')).toBe(true);
  });

  it('should contain a title with the folder name', () => {
    const wrapper = render(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    );
    expect(wrapper.find('code').text()).toBe('/path/to/folder');
  });

  it('should contain an .import-form', () => {
    const wrapper = render(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    );
    expect(wrapper.find('.import-form')).toHaveLength(1);
  });

  it('should contain a .tracklist-view', () => {
    const wrapper = render(
      <ImportView
        onFormSubmit={jest.fn()}
        folderToImport='/path/to/folder'
        tracks={tracks}/>
    );
    expect(wrapper.find('.tracklist-view')).toHaveLength(1);
  });
});
