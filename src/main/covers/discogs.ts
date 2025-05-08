import type { Release, Artist } from '@/types/types';
import { log } from "../logger";
import { normalizeDiacritics } from '@/lib/utils';
import { version } from '../../../package.json';
import { normalizeArtist, normalizeTitle } from '.';

type SearchParams = {
    artist: string;
    title: string;
    year?: number;
};

export type DiscogsSecrets = {
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
    log('covers:discogs:search', url);
    const response = await fetch(
        url,
        { headers: { "User-Agent": `playa/${version}` } }
    );
    const data = await response.json();
    return data;
}

type SearchCoverParams = {
    release: Release;
    artist: Artist;
};

export async function searchCover(
    { release, artist }: SearchCoverParams,
    secrets: DiscogsSecrets
) {
    const title = normalizeTitle(release.title);
    const artistName = normalizeArtist(artist.name);
    const response = await search({
        artist: artistName,
        title,
    }, secrets);
    if (!response?.results?.length) {
        log('covers:discogs:searchCover', `No response for: ${artistName} - ${title}`);
        return null;
    }
    const { cover_image } = response.results[0];
    log('covers:discogs:searchCover', 'Downloading:', artistName, title);
    if (!cover_image || cover_image.endsWith('spacer.gif')) {
        log('covers:discogs:searchCover', 'No response for:', artistName, title);
        return null;
    }
    return cover_image;
}
