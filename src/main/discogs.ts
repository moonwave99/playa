import type { Release, Artist } from '@/types/types';
import { log } from "./logger";
import { normalizeDiacritics } from '@/lib/utils';
import { version } from '../../package.json';
import { getImageFromURL } from "./image";

type SearchParams = {
    artist: string;
    title: string;
    year?: number;
};

type DiscogsSecrets = {
    DISCOGS_KEY: string;
    DISCOGS_SECRET: string;
};

export async function search({ artist, title }: SearchParams, secrets: DiscogsSecrets) {
    const params = new URLSearchParams({
        artist: normalizeDiacritics(artist),
        title: normalizeDiacritics(title),
        key: secrets.DISCOGS_KEY,
        secret: secrets.DISCOGS_SECRET,
    });
    const url = `https://api.discogs.com/database/search?${params}`;
    log('discogs:search', url);
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
        log(`discogs:searchCover', 'No response for: ${artistName} - ${title}`);
        return null;
    }
    const { cover_image } = response.results[0];
    log('discogs:searchCover', 'Downloading:', artistName, title);
    if (!cover_image || cover_image.endsWith('spacer.gif')) {
        log('discogs:searchCover', 'No response for:', artistName, title);
        return null;
    }
    log('discogs:getImage', 'Downloading:', cover_image);
    try {
        return await getImageFromURL({
            outputPath,
            hash: release.hash,
            url: cover_image,
        });
    } catch (error) {
        log('discogs:searchCover', error);
        return false;
    }
}
