import React, { FC, useMemo, useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import cx from 'classnames';
import useNativeDrop from '../../../../hooks/useNativeDrop/useNativeDrop';
import { Artist } from '../../../../store/modules/artist';
import { getHashCode, intToHSL } from '../../../../utils/colorUtils';
import { formatArtistName } from '../../../../utils/artistUtils';
import {
  getArtistPictureRequest,
  getArtistPictureFromUrlRequest
} from '../../../../store/modules/artist';
import { ARTIST_SHOW } from '../../../../routes';

type ArtistGridTileViewProps = {
  artist: Artist;
  style?: object;
  onContextMenu: Function;
};

export const ArtistGridTileView: FC<ArtistGridTileViewProps> = ({
  artist,
  style,
  onContextMenu
}) => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { _id, _rev, name, picture } = artist;
  const [viewRef, inView] = useInView({ triggerOnce: true });
  const [seed, setSeed] = useState(0);

  function onDrop(url: string): void {
    dispatch(getArtistPictureFromUrlRequest(artist, url));
  }

  const {
    isOver,
    canDrop,
    drop
  } = useNativeDrop({
    onDrop,
    filter: (type: string) => type.startsWith('image')
  });

  drop(ref);

  useEffect(() => {
    if (inView && !picture) {
      dispatch(getArtistPictureRequest(artist));
    }
  }, [picture, inView]);

  useEffect(() => {
    setSeed(seed + 1);
  }, [_rev]);

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(artist);
  }

  const backgroundColor = useMemo(() => intToHSL(getHashCode(name)), [name]);

  const classNames = cx('artist-list-item', {
    loaded: !! picture,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });
	return (
    <article ref={viewRef} onContextMenu={_onContextMenu} style={style}>
      <Link
        id={`artist-${name}`}
        className={classNames}
        to={generatePath(ARTIST_SHOW, { _id })}>
        <span
          className="artist-picture-wrapper"
          style={{ backgroundColor }} ref={ref}>
          <span
            className="artist-picture"
            style={{
              backgroundImage: picture ? `url('file://${encodeURI(picture)}?seed=${seed}')` : null
            }}></span>
        </span>
        <span className="artist-name">{formatArtistName(name)}</span>
      </Link>
    </article>
	);
}
