import { useState } from "react";
import { useNavigate } from "react-router";
import { useNavigateSidebar } from "../hooks/ipc";
import { useKeyManager } from "../hooks/useKeyboardManager";
import type { Artist, Collection, Sidebars } from "@/types/types";
import Nav from "./Nav";
import Sidebar from "./Sidebar";
import MusicSidebar from "./MusicSidebar";
import { getArtistLink, getCollectionLink } from "@/lib/links";

export const sidebarsMap: { sidebar: Sidebars; label: string }[] = [
    {
        sidebar: "music",
        label: "Music",
    },
    {
        sidebar: "artists",
        label: "Artists",
    },
    {
        sidebar: "collections",
        label: "Collections",
    },
];

export default function NewSidebar() {
    const navigate = useNavigate();
    const { setContext } = useKeyManager({});
    const [currentSidebar, setCurrentSidebar] = useState<Sidebars>("music");
    useNavigateSidebar((sidebar: Sidebars) => {
        setCurrentSidebar(sidebar);
        setContext("sidebar");
    });

    return (
        <>
            <Nav
                currentSidebar={currentSidebar}
                selectSidebar={setCurrentSidebar}
                sidebarsMap={sidebarsMap}
            />
            {currentSidebar === "music" ? <MusicSidebar /> : null}
            {currentSidebar === "artists" ? (
                <Sidebar
                    label="artists"
                    filterFn={({ name }: Artist, query: string) =>
                        name.toLowerCase().includes(query.toLowerCase())
                    }
                    onEnter={(artist: Artist) =>
                        navigate(getArtistLink(artist))
                    }
                    onContextMenu={window.api.menu.artist}
                    getLink={getArtistLink}
                    getEntryText={({ name }: Artist) => name}
                    queryConfig={() => ({
                        queryKey: ["artists"],
                        queryFn: () => window.api.data.getAllArtists(),
                    })}
                />
            ) : null}
            {currentSidebar === "collections" ? (
                <Sidebar
                    label="collections"
                    filterFn={({ title }: Collection, query: string) =>
                        title.toLowerCase().includes(query.toLowerCase())
                    }
                    onEnter={(collection: Collection) =>
                        navigate(getCollectionLink(collection))
                    }
                    onContextMenu={window.api.menu.collection}
                    getLink={getCollectionLink}
                    getEntryText={({ title }: Collection) => title}
                    queryConfig={() => ({
                        queryKey: ["collections"],
                        queryFn: () => window.api.data.getCollections(),
                    })}
                />
            ) : null}
        </>
    );
}
