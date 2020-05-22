import React, { ReactElement, FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './OnboardingView.scss';

type OnboardingViewProps = {
  onDismiss: Function;
}

export const OnboardingView: FC<OnboardingViewProps> = ({
  onDismiss
}): ReactElement => {
  const { t } = useTranslation();
  const [canDismiss, setDismiss] = useState(false);

  function onDismissButtonClick(): void {
    if (!canDismiss) {
      return;
    }
    onDismiss();
  }

  return (
    <section className="onboarding">
      <h1>{t('onboarding.title')}</h1>
      <footer className="onboarding-footer">
        <button
          disabled={!canDismiss}
          className="button button-full onboarding-dismiss"
          onClick={onDismissButtonClick}>
          {t('onboarding.dismiss')}
        </button>
      </footer>
    </section>
  );
}
