import React from 'react';
import { renderInAll, mountInAll } from '../../../../../../test/testUtils';

import { EditableTitle } from './EditableTitle';

describe('EditableTitle', () => {
  it('should contain a title', () => {
    const wrapper = renderInAll(
			<EditableTitle
        title="Title"
        onTitleClick={jest.fn()}
        onSubmit={jest.fn()}
        onBlur={jest.fn()}
      />
		);
    expect(wrapper.is('h1.heading')).toBe(true);
    expect(wrapper.find('.heading-main').text()).toEqual('Title');
    expect(wrapper.find('.heading-sub')).toHaveLength(0);
  });

  it('should contain a subTitle if passed', () => {
    const wrapper = renderInAll(
			<EditableTitle
        title="Title"
        subTitle="Subtitle"
        onTitleClick={jest.fn()}
        onSubmit={jest.fn()}
        onBlur={jest.fn()}
      />
		);
    expect(wrapper.is('h1.heading')).toBe(true);
    expect(wrapper.find('.heading-main').text()).toEqual('Title');
    expect(wrapper.find('.heading-sub').text()).toEqual('Subtitle');
  });

  it('should contain a form if isEditing', () => {
    const wrapper = renderInAll(
			<EditableTitle
        isEditing
        title="Title"
        onTitleClick={jest.fn()}
        onSubmit={jest.fn()}
        onBlur={jest.fn()}
      />
		);
    expect(wrapper.is('form.edit-title-form')).toBe(true);
    expect(wrapper.find('input[name="title"]').attr('value')).toBe('Title');
  });

  it('should call the onTitleClick handler when title is clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
			<EditableTitle
        title="Title"
        onTitleClick={handler}
        onSubmit={jest.fn()}
        onBlur={jest.fn()}
      />
		);
    wrapper.simulate('click');
    expect(handler).toHaveBeenCalled();
  });

  it('should call the onSubmit handler when form is submit', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
			<EditableTitle
        isEditing
        title="Title"
        onTitleClick={jest.fn()}
        onSubmit={handler}
        onBlur={jest.fn()}
      />
		);
    wrapper.simulate('submit');
    expect(handler).toHaveBeenCalledWith('Title');
  });

  it('should call the onBlur handler when form loses focus', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
			<EditableTitle
        isEditing
        title="Title"
        onTitleClick={jest.fn()}
        onSubmit={jest.fn()}
        onBlur={handler}
      />
		);
    wrapper.find('input[name="title"]').simulate('blur');
    expect(handler).toHaveBeenCalled();
  });

  it('should call the onBlur handler when Escape key is pressed', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
			<EditableTitle
        isEditing
        title="Title"
        onTitleClick={jest.fn()}
        onSubmit={jest.fn()}
        onBlur={handler}
      />
		);
    wrapper.find('input[name="title"]').simulate('keydown', { key: 'Escape' });
    expect(handler).toHaveBeenCalled();
  });
});
