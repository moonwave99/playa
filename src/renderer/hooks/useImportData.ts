import { useState, useEffect } from "react";
import useStore from "../store";
import api from "../api";

type UseImportDataParams = {
  onDone: () => void;
  closeAfter?: number;
};

export default function useImportData({
  onDone,
  closeAfter,
}: UseImportDataParams) {
  const [steps, setSteps] = useState<Record<string, boolean>>({});
  const [isDone, setDone] = useState(false);
  const { setModalFixed } = useStore();

  useEffect(() => {
    const unsubscribe = [
      api.import.onProgress((step, completed) => {
        setModalFixed(true);
        if (step !== "done") {
          setSteps((prev) => ({ ...prev, [step]: completed }));
          return;
        }
        setDone(true);
        if (!closeAfter) {
          return;
        }
        setTimeout(onDone, closeAfter);
      }),
      api.import.onError((message) => {
        window.alert(message);
        setModalFixed(false);
      }),
    ];

    return () => unsubscribe.forEach((u) => u());
  }, [closeAfter]);

  return {
    steps: Object.entries(steps),
    isDone,
  };
}
