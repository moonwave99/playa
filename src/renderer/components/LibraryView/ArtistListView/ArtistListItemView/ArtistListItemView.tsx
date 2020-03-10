import React, { FC } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Artist } from '../../../../store/modules/library';

import { ARTISTS_SHOW } from '../../../../routes';

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
      to={generatePath(ARTISTS_SHOW, { artist: _id })}>
      <span className="artist-name">{name}</span>
      <span className="release-count">{count}</span>
    </Link>
	);
}
