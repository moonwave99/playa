import { useState } from "react";
import { Release } from "@/types/types";
import Cover from "./Cover";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";

type CoverLightboxProps = {
    release: Release;
    context?: Release[];
    onClose: () => void;
};

export default function CoverLightbox({
    release,
    context,
    onClose,
}: CoverLightboxProps) {
    const [currentRelease, setCurrentRelease] = useState(release);
    const currentIndex = context?.findIndex((x) => x.id === currentRelease.id);
    useKeyManager({
        context: "modal",
        handlers: {
            " ": withPrevent(onClose),
            ...(context?.length > 1
                ? {
                      ArrowRight: () => {
                          setCurrentRelease(
                              context[(currentIndex + 1) % context.length]
                          );
                      },
                      ArrowLeft: () => {
                          setCurrentRelease(
                              context[
                                  currentIndex === 0
                                      ? context.length - 1
                                      : currentIndex - 1
                              ]
                          );
                      },
                  }
                : {}),
        },
    });

    return <Cover {...currentRelease} />;
}
