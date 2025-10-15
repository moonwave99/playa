import { useState, useEffect, useRef } from "react";
import useStore from "../store";
import api from "../api";

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

  useEffect(() => {
    const unsubscribe = [
      api.import.onProgress((step: string, completed: boolean) => {
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
      }),
      api.import.onError((message: string) => {
        window.alert(message);
        setModalFixed(false);
        if (onCancel) {
          onCancel();
        }
      }),
    ];

    return () => unsubscribe.forEach((u) => u());
  }, [closeAfter]);

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
