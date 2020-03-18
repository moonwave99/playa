import React from 'react';
import { renderInAll, mountInAll } from '../../../../test/testUtils';

import { AboutView } from './AboutView';

const props = {
  name: 'Playa',
  description: 'The player that thinks in albums',
  version: '1.0',
  author: {
    name: "Author Name",
		email: "hello@example.com",
		url: "https://www.author.site"
  },
  homepage: 'https://www.playa.com/',
  repository: 'https://www.playa.com/repo',
  tos: 'https://www.playa.com/tos',
};

describe('AboutView', () => {
  it('should render a .about', () => {
		const wrapper = renderInAll(
			<AboutView
        name={props.name}
        description={props.description}
        version={props.version}
        author={props.author}
        homepage={props.homepage}
        repository={props.repository}
        tos={props.tos}
				onLinkClick={jest.fn()}
			/>
		);
		expect(wrapper.is('.about')).toBe(true);
  });

  it('should contain a title', () => {
		const wrapper = renderInAll(
			<AboutView
        name={props.name}
        description={props.description}
        version={props.version}
        author={props.author}
        homepage={props.homepage}
        repository={props.repository}
        tos={props.tos}
				onLinkClick={jest.fn()}
			/>
		);
		expect(wrapper.find('h1').text()).toBe(`${props.name}, ${props.description}`);
  });

  it('should render the version', () => {
		const wrapper = renderInAll(
			<AboutView
        name={props.name}
        description={props.description}
        version={props.version}
        author={props.author}
        homepage={props.homepage}
        repository={props.repository}
        tos={props.tos}
				onLinkClick={jest.fn()}
			/>
		);
		expect(wrapper.find('.version').text()).toContain(props.version);
  });

  it('should render the app links', () => {
		const wrapper = renderInAll(
			<AboutView
        name={props.name}
        description={props.description}
        version={props.version}
        author={props.author}
        homepage={props.homepage}
        repository={props.repository}
        tos={props.tos}
				onLinkClick={jest.fn()}
			/>
		);
    [
      props.homepage,
      props.repository,
      props.tos
    ].forEach(
      link => expect(wrapper.find(`.links a[href="${link}"]`)).toHaveLength(1)
    );
  });

  it('should call the onLinkClick when a link is clicked', () => {
    const handler = jest.fn();
    const wrapper = mountInAll(
			<AboutView
        name={props.name}
        description={props.description}
        version={props.version}
        author={props.author}
        homepage={props.homepage}
        repository={props.repository}
        tos={props.tos}
				onLinkClick={handler}
			/>
		);
    const link = wrapper.find('a').at(0);
    link.simulate('click');
		expect(handler).toHaveBeenCalledWith(link.prop('href'));
  });
});
