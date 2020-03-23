import React, { FC } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { Artist } from '../../../../store/modules/artist';

import { formatArtistName } from '../../../../utils/artistUtils';
import { ARTIST_SHOW } from '../../../../routes';

type ArtistListItemViewProps = {
  artist: Artist;
};

export const ArtistListItemView: FC<ArtistListItemViewProps> = ({
  artist
}) => {
  const { _id, name } = artist;
	return (
    <Link
      id={`artist-${name}`}
      className="artist-list-item"
      to={generatePath(ARTIST_SHOW, { _id })}>
      <span className="artist-name">{formatArtistName(name)}</span>
    </Link>
	);
}
