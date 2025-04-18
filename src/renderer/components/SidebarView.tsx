import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../api";
import { useNavigateSidebar } from "../hooks/ipc";
import {
    useKeyManager,
    KeyManager,
    withPrevent,
} from "../hooks/useKeyboardManager";
import type { Artist, Collection, Group, Sidebars } from "@/types/types";
import SearchToggler from "./SearchToggler";
import Sidebar from "./Sidebar";
import MusicSidebar from "./MusicSidebar";
import { getArtistLink, getCollectionLink, getGroupLink } from "@/lib/links";
import { lowerCaseCompare } from "@/lib/utils";

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
    {
        sidebar: "groups",
        label: "Groups",
        accelerator: "$",
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

    useEffect(() => {
        return () => {
            api.state.setInputFocused(false);
        };
    }, []);

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
                    filterFn={({ normalizedName }: Artist, query) =>
                        lowerCaseCompare(normalizedName, query)
                    }
                    onEnter={(artist) => navigate(getArtistLink(artist))}
                    onContextMenu={api.menu.artist}
                    getLink={getArtistLink}
                    getEntryText={({ name }: Artist) => name}
                    queryConfig={() => ({
                        queryKey: ["artists"],
                        queryFn: api.artist.getAllArtists,
                    })}
                />
            ) : null}
            {currentSidebar === "collections" ? (
                <Sidebar
                    label="collections"
                    filterFn={({ title }: Collection, query) =>
                        lowerCaseCompare(title, query)
                    }
                    onEnter={(collection) =>
                        navigate(getCollectionLink(collection))
                    }
                    onContextMenu={api.menu.collection}
                    getLink={getCollectionLink}
                    getEntryText={({ title }: Collection) => title}
                    queryConfig={() => ({
                        queryKey: ["collections"],
                        queryFn: api.collection.getAllCollections,
                    })}
                />
            ) : null}
            {currentSidebar === "groups" ? (
                <Sidebar
                    label="groups"
                    filterFn={({ title }: Collection, query) =>
                        lowerCaseCompare(title, query)
                    }
                    onEnter={(collection) => navigate(getGroupLink(collection))}
                    onContextMenu={api.menu.group}
                    getLink={getGroupLink}
                    getEntryText={({ title }: Group) => title}
                    queryConfig={() => ({
                        queryKey: ["groups"],
                        queryFn: api.group.getAllGroups,
                    })}
                />
            ) : null}
        </>
    );
}
