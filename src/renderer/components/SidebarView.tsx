import { useState } from "react";
import { useNavigate } from "react-router";
import { useNavigateSidebar } from "../hooks/ipc";
import {
    useKeyManager,
    KeyManager,
    withPrevent,
} from "../hooks/useKeyboardManager";
import type { Artist, Collection, Sidebars } from "@/types/types";
import SearchToggler from "./SearchToggler";
import Sidebar from "./Sidebar";
import MusicSidebar from "./MusicSidebar";
import { getArtistLink, getCollectionLink } from "@/lib/links";

export const sidebarsMap: {
    sidebar: Sidebars;
    label: string;
    accelerator: string;
}[] = [
    {
        sidebar: "music",
        label: "Music",
        accelerator: "!",
    },
    {
        sidebar: "artists",
        label: "Artists",
        accelerator: "@",
    },
    {
        sidebar: "collections",
        label: "Collections",
        accelerator: "#",
    },
];

export default function SidebarView() {
    const [currentSidebar, setCurrentSidebar] = useState<Sidebars>("music");

    const navigate = useNavigate();
    const { setContext } = useKeyManager({
        context: KeyManager.global,
        handlers: sidebarsMap.reduce(
            (memo, { accelerator, sidebar }) => ({
                ...memo,
                [accelerator]: withPrevent(() => setCurrentSidebar(sidebar)),
            }),
            {}
        ),
    });

    useNavigateSidebar((sidebar: Sidebars) => {
        setCurrentSidebar(sidebar);
        setContext("sidebar");
    });

    return (
        <>
            <SearchToggler
                currentSidebar={currentSidebar}
                selectSidebar={setCurrentSidebar}
                sidebarsMap={sidebarsMap}
            />
            {currentSidebar === "music" ? <MusicSidebar /> : null}
            {currentSidebar === "artists" ? (
                <Sidebar
                    label="artists"
                    filterFn={({ name }: Artist, query) =>
                        filterFn(name, query)
                    }
                    onEnter={(artist) => navigate(getArtistLink(artist))}
                    onContextMenu={window.api.menu.artist}
                    getLink={getArtistLink}
                    getEntryText={({ name }: Artist) => name}
                    queryConfig={() => ({
                        queryKey: ["artists"],
                        queryFn: window.api.data.getAllArtists,
                    })}
                />
            ) : null}
            {currentSidebar === "collections" ? (
                <Sidebar
                    label="collections"
                    filterFn={({ title }: Collection, query) =>
                        filterFn(title, query)
                    }
                    onEnter={(collection) =>
                        navigate(getCollectionLink(collection))
                    }
                    onContextMenu={window.api.menu.collection}
                    getLink={getCollectionLink}
                    getEntryText={({ title }: Collection) => title}
                    queryConfig={() => ({
                        queryKey: ["collections"],
                        queryFn: window.api.data.getAllCollections,
                    })}
                />
            ) : null}
        </>
    );
}

function filterFn(key: string, query: string) {
    return key.toLowerCase().includes(query.toLowerCase());
}
