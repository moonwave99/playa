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
import {
  Album,
  getAlbumRequest,
  getAlbumContentById,
  getAlbumCoverRequest,
  getAlbumCoverFromUrlRequest
} from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import {
  formatArtist,
  showTrackNumbers,
  showTrackArtists
} from '../../../utils/albumUtils';
import { ARTIST_SHOW } from '../../../routes';
import useGrid, { KeyboardDirections } from '../../../hooks/useGrid/useGrid';
import './AlbumDetailView.scss';

type AlbumDetailViewProps = {
  album: Album;
  isCurrent?: boolean;
  hasFocus?: boolean;
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

export const AlbumDetailView: FC<AlbumDetailViewProps> = ({
  album,
  isCurrent = false,
  hasFocus = false,
  currentTrackId,
  dragType,
  onContextMenu,
  onDoubleClick
}) => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [seed, setSeed] = useState(0);
  const [palette, setPalette] = useState({} as Palette);
  const { _id, _rev, year, title, cover } = album;
  const [viewRef, inView] = useInView({ triggerOnce: true });

  const {
    artist,
    tracks
  } = useSelector((state: ApplicationState) => getAlbumContentById(state, _id));

  function onEnter(selection: Track['_id'][]): void {
    const track = tracks.find(({ _id }) => _id === selection[0]);
    onDoubleClick({ album, track });
  }

  const {
    selection,
    setFocus,
    selectItem,
  } = useGrid({
    items: album.tracks.map(_id => ({ _id })),
    direction: KeyboardDirections.Vertical,
    clearSelectionOnBlur: false,
    onEnter
  });

  useEffect(() => {
    setFocus(hasFocus);
  }, [hasFocus]);

  useEffect(() => {
    selectItem(album.tracks[0]);
  }, [album.tracks]);

  useEffect(() => {
    inView && dispatch(getAlbumRequest(_id));
  }, [_id, inView, artist]);

  useEffect(() => {
    if (!cover) {
      dispatch(getAlbumCoverRequest(album));
    }
  }, [cover]);

  useEffect(() => {
    setSeed(seed + 1);
  }, [_rev]);

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
    dispatch(getAlbumCoverFromUrlRequest(album, url));
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

  function onCoverDoubleClick(): void {
    onDoubleClick({ album });
  }

  function onTrackDoubleClick(track: Track): void {
    onDoubleClick({ album, track });
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu({ album, artist });
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
            src={`${cover}?seed=${seed}`}
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
          albumId={album._id}
          selectedTrackId={selection[0]}
          currentTrackId={currentTrackId}
          showArtists={showTrackArtists(album)}
          showTrackNumbers={showTrackNumbers(album)}
          onTrackDoubleClick={onTrackDoubleClick}/>
      </section>
    </article>
  );
}
