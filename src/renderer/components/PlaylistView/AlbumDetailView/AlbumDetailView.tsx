import React, { FC, ReactElement, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useDrag } from 'react-dnd';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Vibro from 'node-vibrant';
import cx from 'classnames';
import useNativeDrop from '../../../hooks/useNativeDrop/useNativeDrop';
import { CoverView } from '../../CoverView/CoverView';
import { TracklistView } from '../../AlbumListView/AlbumView/TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, getAlbumRequest, getAlbumContentById } from '../../../store/modules/album';
import { getCoverFromUrlRequest } from '../../../store/modules/cover';
import { Track } from '../../../store/modules/track';
import {
  formatArtist,
  showTrackNumbers,
} from '../../../utils/albumUtils';
import { ARTIST_SHOW } from '../../../routes';
import './AlbumDetailView.scss';

type AlbumDetailViewProps = {
  album: Album;
  isCurrent?: boolean;
  currentTrackId: Track['_id'];
  dragType: string;
  onContextMenu: Function;
  onDoubleClick: Function;
}

type Palette = {
  loaded: boolean;
  DarkMuted: string;
  DarkVibrant: string;
  Muted: string;
  Vibrant: string;
  LightMuted: string;
  LightVibrant: string;
}

// #TODO push notFoundAction
export const AlbumDetailView: FC<AlbumDetailViewProps> = ({
  album,
  isCurrent = false,
  currentTrackId,
  dragType,
  onContextMenu,
  onDoubleClick
}) => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [palette, setPalette] = useState({} as Palette);
  const { _id, year, title } = album;
  const [viewRef, inView] = useInView({ triggerOnce: true });

  const {
    cover,
    artist,
    tracks
  } = useSelector((state: ApplicationState) => getAlbumContentById(state, _id));

  useEffect(() => {
    inView && dispatch(getAlbumRequest(_id));
  }, [_id, inView, artist]);

  const [{ opacity }, drag] = useDrag({
    item: {
      type: dragType,
      _id,
      selection: [_id]
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  function onDrop(url: string): void {
    dispatch(getCoverFromUrlRequest(album, url));
  }

  const {
    isOver,
    canDrop,
    drop
  } = useNativeDrop({
    onDrop,
    filter: (type: string) => type.startsWith('image')
  });

  drag(drop(ref));

  function onCoverDoubleClick(album: Album): void {
    onDoubleClick(album);
  }

  function onTrackDoubleClick(track: Track): void {
    onDoubleClick(album, artist, track);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album, artist);
  }

  function onActionsButtonClick(): void {
    _onContextMenu();
  }

  async function onImageLoad(src: string): Promise<void> {
    const {
      DarkMuted,
      DarkVibrant,
      Muted,
      Vibrant,
      LightMuted,
      LightVibrant
    } = await Vibro.from(src).getPalette();
    setPalette({
      loaded: true,
      DarkMuted: DarkMuted.getHex(),
      DarkVibrant: DarkVibrant.getHex(),
      Muted: Muted.getHex(),
      Vibrant: Vibrant.getHex(),
      LightMuted: LightMuted.getHex(),
      LightVibrant: LightVibrant.getHex()
    });
  }

  function renderArtist(): ReactElement {
    if (!artist) {
      return <span className="album-artist loading"></span>;
    }
    const { _id } = artist;
    return (
      <Link
        to={generatePath(ARTIST_SHOW, { _id })}
        className="album-artist">
          {formatArtist({ album, artist })}
      </Link>
    );
  }

  const albumClasses = cx('album-detail-view', { 'is-current': isCurrent });

  const coverClasses = cx('album-cover', {
    'loaded': palette.loaded,
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });
  return (
    <article className={albumClasses} id={`album-${_id}`} onContextMenu={_onContextMenu} ref={viewRef}>
      <header className="album-header" style={{ backgroundColor: palette.DarkMuted }}>
        <div ref={ref} style={{ opacity }} className="album-cover-wrapper">
          <CoverView
            className={coverClasses}
            src={cover}
            album={album}
            onImageLoad={onImageLoad}
            onDoubleClick={onCoverDoubleClick}/>
          </div>
        <div className="album-info-wrapper">
          <h2 style={{ color: palette.LightVibrant }}>
            {title}
            <button
              onClick={onActionsButtonClick}
              className="button button-frameless button-album-actions"
              style={{ color: palette.LightVibrant }}>
              <FontAwesomeIcon className="icon" icon="ellipsis-h"/>
            </button>
          </h2>
          <p className="album-info">
            {year && <span className="album-year">{year}</span>}{renderArtist()}
          </p>
        </div>
      </header>
      <section className="album-content">
        <TracklistView
          tracklist={album.tracks}
          tracks={tracks}
          currentTrackId={currentTrackId}
          showArtists={false}
          showTrackNumbers={showTrackNumbers(album)}
          onTrackDoubleClick={onTrackDoubleClick}/>
      </section>
    </article>
  );
}
