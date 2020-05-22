import React, { ReactElement, FC, useState } from 'react';
import Slider from "react-slick";
import { useTranslation } from 'react-i18next';
import './OnboardingView.scss';

import slide1 from '../../static/onboarding/slide-1.svg';
import slide2 from '../../static/onboarding/slide-2.svg';
import slide3 from '../../static/onboarding/slide-3.svg';

type OnboardingViewProps = {
  onDismiss: Function;
}

const slides = [
  slide1,
  slide2,
  slide3
];

export const OnboardingView: FC<OnboardingViewProps> = ({
  onDismiss
}): ReactElement => {
  const { t } = useTranslation();
  const [isDismissable, setDismissable] = useState(false);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  function renderSlides(): ReactElement[] {
    return slides.map((slide, i) => (
      <div className="onboarding-slide" key={i}>
        <p className="onboarding-slide-image-wrapper">
          <img src={slide}/>
        </p>
        <p className="onboarding-slide-caption">
          {t(`onboarding.slides.${i}.caption`)}
        </p>
      </div>)
    );
  }

  function onSlideChange(index: number): void {
    if (index === slides.length - 1) {
      setDismissable(true);
    }
  }

  function onDismissButtonClick(): void {
    if (!isDismissable) {
      return;
    }
    onDismiss();
  }

  return (
    <section className="onboarding">
      <h1>{t('onboarding.title')}</h1>
      <Slider
        className="onboarding-carousel"
        afterChange={onSlideChange}
        {...sliderSettings}>
        { renderSlides() }
      </Slider>
      <footer className="onboarding-footer">
        <button
          disabled={!isDismissable}
          className="button button-full onboarding-dismiss"
          onClick={onDismissButtonClick}>
          {t('onboarding.dismiss')}
        </button>
      </footer>
    </section>
  );
}
