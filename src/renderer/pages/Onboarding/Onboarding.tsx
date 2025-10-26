import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "motion/react";
import useStore from "@/renderer/store";
import api from "@/renderer/api";

import SplashStep from "./Steps/SplashStep";
import SetupAppsStep from "./Steps/SetupAppsStep";
import DiscogsStep from "./Steps/DiscogsStep";
import SetupLibraryStep from "./Steps/SetupLibraryStep";
import ImportMusicStep from "./Steps/ImportMusicStep";
import FinalStep from "./Steps/FinalStep";

import cx from "clsx";
import { GoDot, GoDotFill } from "react-icons/go";
import styles from "./Onboarding.module.css";

export type StepProps = {
  onCancel: () => void;
  onNextStep: () => void;
  onSkipStep?: () => void;
};

const stepsMap = {
  splash: SplashStep,
  setupLibrary: SetupLibraryStep,
  setupApps: SetupAppsStep,
  discogs: DiscogsStep,
  importMusic: ImportMusicStep,
  final: FinalStep,
};

export type Steps = keyof typeof stepsMap;

export default function Onboarding() {
  const { t } = useTranslation();
  const { steps, currentStep, setCurrentStep } = useOnboarding();

  return (
    <div className={styles.view} data-testid="Onboarding">
      <AnimatePresence mode="wait" initial={true}>
        {steps[currentStep]}
      </AnimatePresence>
      <ol className={styles.stepIndicator} data-testid="StepIndicator">
        {Array.from({ length: steps.length }, (_, step) => (
          <li key={step}>
            <button
              className={cx({ [styles.current]: step === currentStep })}
              onClick={() => setCurrentStep(step)}
              aria-label={t(`pages.Onboarding.gotoStep.${step}`)}
              disabled={step >= currentStep}
            >
              {step === currentStep ? <GoDotFill /> : <GoDot />}
            </button>
          </li>
        ))}
      </ol>
      <footer className={styles.footer}>
        <a href={t("pages.Onboarding.copyright.link")} target="_blank">
          {t("pages.Onboarding.copyright.text")}
        </a>
      </footer>
    </div>
  );
}

function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const { setSettings, settings } = useStore();

  useEffect(() => {
    api.state.setOnboarding(true);
    return () => api.state.setOnboarding(false);
  }, []);

  function onCancel() {
    api.settings
      .updateSettings({
        ...settings,
        SHOW_ONBOARDING_ON_STARTUP: false,
      })
      .then(setSettings);
  }

  function onNextStep() {
    if (currentStep === steps.length - 1) {
      onCancel();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  }

  const steps = Object.values(stepsMap).map((Component) => (
    <Component onNextStep={onNextStep} onCancel={onCancel} />
  ));

  return {
    steps,
    currentStep,
    setCurrentStep,
  };
}
