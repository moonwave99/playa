import React from 'react';
import { renderInAll } from '../../../../test/testUtils';

import { OnboardingView } from './OnboardingView';

describe('OnboardingView', () => {
  it('should render a .onboarding', () => {
		const wrapper = renderInAll(
			<OnboardingView onDismiss={jest.fn()}/>
		);
		expect(wrapper.is('.onboarding')).toBe(true);
  });
});
