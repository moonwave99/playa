import path from "path";
import download from "image-downloader";
import type { Release, Artist } from '@/types/types';
import { DISCOGS_KEY, DISCOGS_SECRET } from '../../settings.json';

type SearchParams = {
    artist: string;
    title: string;
    year: number;
};

export async function search({ artist, title, year }: SearchParams) {
    const params = new URLSearchParams({
        artist: normalize(artist),
        title: normalize(title),
        year: `${year}`,
        key: DISCOGS_KEY,
        secret: DISCOGS_SECRET,
    });
    const response = await fetch(
        `https://api.discogs.com/database/search?${params}`,
        {
            headers: {
                "User-Agent": "playa-web/0.1",
            },
        }
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

export async function searchCover({ release, artist, outputPath }: SearchCoverParams) {
    const title = normalizeTitle(release.title);
    const artistName = normalizeArtist(artist.name);
    const response = await search({
        artist: artistName,
        title,
        year: release.year,
    });
    if (!response?.results?.length) {
        console.log(`No response for: ${artistName} - ${title}`);
        return null;
    }
    const { cover_image } = response.results[0];
    console.log("Downloading: ", artistName, title);
    if (!cover_image) {
        return false;
    }
    const pic = `${release.hash}-cover.jpg`;
    await getImage({
        url: cover_image,
        dest: path.join(outputPath, pic),
    });
    return pic;
}

type GetImageFromURLParams = {
    outputPath: string;
    hash: string;
    url: string;
};

export async function getImageFromURL({ outputPath, hash, url }: GetImageFromURLParams) {
    const dest = path.join(outputPath, `${hash}-cover.jpg`);
    await getImage({ url, dest });
    return dest;
}

type GetImageParams = {
    url: string;
    dest: string;
};

async function getImage(options: GetImageParams) {
    console.log("Downloading: ", options.url);
    await wait();
    await download.image(options);
}

const TIMEOUT = 500;
const wait = (ms = TIMEOUT) =>
    new Promise((resolve) => setTimeout(resolve, ms));

function normalize(input: string) {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
