import React, { FC } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Artist } from '../../../../store/modules/library';

import { ARTIST_SHOW } from '../../../../routes';

type ArtistListItemViewProps = {
  artist: Artist;
};

export const ArtistListItemView: FC<ArtistListItemViewProps> = ({
  artist
}) => {
  const { _id, name, count } = artist;
	return (
    <Link
      className="artist-list-item"
      to={generatePath(ARTIST_SHOW, { name: _id })}>
      <span className="artist-name">{name}</span>
      <span className="release-count">{count}</span>
    </Link>
	);
}
