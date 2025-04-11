import type { MouseEvent } from "react";
import { Link as RouterLink, LinkProps } from "react-router";

export default function Link(props: LinkProps) {
    return (
        <RouterLink
            {...props}
            onDragStart={(event) => event.preventDefault()}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                if (event.metaKey) {
                    event.preventDefault();
                    return;
                }
                if (props.onClick) {
                    props.onClick(event);
                }
            }}
        />
    );
}
