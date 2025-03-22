import type { MouseEvent } from "react";
import { Link as RouterLink, LinkProps } from "react-router";

export default function Link(props: LinkProps) {
    return (
        <RouterLink
            {...props}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                if (event.metaKey) {
                    event.preventDefault();
                }
                props.onClick && props.onClick(event);
            }}
        />
    );
}
