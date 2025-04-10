import { Release } from "@/types/types";
import Cover from "./Cover";
import { useKeyManager, withPrevent } from "../hooks/useKeyboardManager";

type CoverLightboxProps = {
    release: Release;
    onClose: () => void;
};

export default function CoverLightbox({
    release,
    onClose,
}: CoverLightboxProps) {
    useKeyManager({
        context: "modal",
        handlers: {
            " ": withPrevent(onClose),
        },
    });
    return <Cover {...release} />;
}
