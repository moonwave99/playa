import { MemoryRouter } from "react-router";
import type { ReactNode } from "react";

export function withRouter(children: ReactNode) {
    return <MemoryRouter>{children}</MemoryRouter>;
}
