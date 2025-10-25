import { useState } from "react";
import { AnimatePresence } from "motion/react";
import useStore from "@/renderer/store";
import api from "@/renderer/api";

import SplashStep from "./Steps/SplashStep";
import SetupLibraryStep from "./Steps/SetupLibraryStep";

import styles from "./Onboarding.module.css";

export type StepProps = {
  onCancel: () => void;
  onNextStep: () => void;
  onSkipStep?: () => void;
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const { setSettings, settings } = useStore();

  function onCancel() {
    api.settings
      .updateSettings({
        ...settings,
        SHOW_ONBOARDING_ON_STARTUP: false,
      })
      .then(setSettings);
  }

  function onNextStep() {
    setCurrentStep((prev) => prev + 1);
  }

  const steps = [
    <SplashStep onCancel={onCancel} onNextStep={onNextStep} />,
    <SetupLibraryStep onCancel={onCancel} onNextStep={onNextStep} />,
  ];

  return (
    <div className={styles.view}>
      <AnimatePresence mode="wait" initial={true}>
        {steps[currentStep]}
      </AnimatePresence>
    </div>
  );
}
