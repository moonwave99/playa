import { useState, useEffect, useRef } from "react";
import { useApiEvents } from "./useApiEvents";
import useStore from "../store";

type UseImportDataParams = {
  onDone: () => void;
  onCancel?: () => void;
  closeAfter?: number;
};

export default function useImportData<T extends HTMLElement>({
  onDone,
  onCancel,
  closeAfter,
}: UseImportDataParams) {
  const [steps, setSteps] = useState<Record<string, boolean>>({});
  const [isDone, setDone] = useState(false);
  const { setModalFixed } = useStore();
  const lastStepRef = useRef<T>(null);

  useApiEvents({
    onImportProgress: (step, completed) => {
      setModalFixed(true);
      if (step !== "done") {
        setSteps((prev) => ({ ...prev, [step]: completed }));
        return;
      }
      setDone(true);
      setModalFixed(false);
      if (!closeAfter) {
        return;
      }
      setTimeout(onDone, closeAfter);
    },
    onImportError: (message) => {
      window.alert(message);
      setModalFixed(false);
      if (onCancel) {
        onCancel();
      }
    },
  });

  useEffect(() => {
    if (!lastStepRef.current) {
      return;
    }
    lastStepRef.current.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  return {
    steps: Object.entries(steps),
    isDone,
    lastStepRef,
  };
}
