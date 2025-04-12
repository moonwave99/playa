import path from "path";
import download from "image-downloader";
import type { Release, Artist } from '@/types/types';
import { deburr } from "lodash";
import { log } from "./logger";
import { wait } from "@/lib/utils";
import { version } from '../../package.json';

type SearchParams = {
    artist: string;
    title: string;
    year?: number;
};

type DiscogsSecrets = {
    DISCOGS_KEY: string;
    DISCOGS_SECRET: string;
};

const THROTTLE_INTERVAL = 500;

export async function search({ artist, title }: SearchParams, secrets: DiscogsSecrets) {
    const params = new URLSearchParams({
        artist: deburr(normalize(artist)),
        title: deburr(normalize(title)),
        key: secrets.DISCOGS_KEY,
        secret: secrets.DISCOGS_SECRET,
    });
    const url = `https://api.discogs.com/database/search?${params}`;
    log('[discogs:search]', url);
    const response = await fetch(
        url,
        { headers: { "User-Agent": `playa/${version}` } }
    );
    const data = await response.json();
    return data;
}

function normalizeTitle(title: string) {
    return title
        .replace(/ CD(\d+)/, "")
        .replaceAll(/\(\w: (.*)\)/g, "")
        .replaceAll(" : ", " / ")
        .replaceAll("!", "")
        .trim();
}

function normalizeArtist(artist: string) {
    if (artist === "_VV_AA_") {
        return "Various";
    }
    return artist.replaceAll("!", "");
}

type SearchCoverParams = {
    release: Release;
    artist: Artist;
    outputPath: string;
};

export async function searchCover(
    { release, artist, outputPath }: SearchCoverParams,
    secrets: DiscogsSecrets
) {
    const title = normalizeTitle(release.title);
    const artistName = normalizeArtist(artist.name);
    const response = await search({
        artist: artistName,
        title,
        year: release.year,
    }, secrets);
    if (!response?.results?.length) {
        log(`[discogs:searchCover] No response for: ${artistName} - ${title}`);
        return null;
    }
    const { cover_image } = response.results[0];
    log('[discogs:searchCover] Downloading:', artistName, title);
    if (!cover_image || cover_image.endsWith('spacer.gif')) {
        log(`[discogs:searchCover] No response for: ${artistName} - ${title}`);
        return null;
    }
    const pic = `${release.hash}-cover.jpg`;
    await getImage({
        url: cover_image,
        dest: path.join(outputPath, pic),
    });
    return pic;
}

export type GetImageFromURLParams = {
    outputPath: string;
    hash: string;
    url: string;
};

export async function getImageFromURL({ outputPath, hash, url }: GetImageFromURLParams) {
    const dest = path.join(outputPath, `${hash}-cover.jpg`);
    try {
        await getImage({ url, dest });
        return dest;
    } catch (error) {
        log('[discogs:getImageFromURL]', error);
        return false;
    }
}

type GetImageParams = {
    url: string;
    dest: string;
};

async function getImage(options: GetImageParams) {
    log('[discogs:getImage] Downloading:', options.url);
    await wait(THROTTLE_INTERVAL);
    await download.image(options);
}

function normalize(input: string) {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\((\d+)\)$/, '')
        .trim();
}
