import React, { FC, ReactElement, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, generatePath } from 'react-router-dom';
import { useDrag } from 'react-dnd';
import { useInView } from 'react-intersection-observer';
import Vibro from 'node-vibrant';
import cx from 'classnames';
import { CoverView } from './CoverView/CoverView';
import { TracklistView } from './TracklistView/TracklistView';
import { ApplicationState } from '../../../store/store';
import { Album, AlbumTypes, VARIOUS_ARTISTS_ID, getAlbumRequest, getAlbumContentById } from '../../../store/modules/album';
import { Track } from '../../../store/modules/track';
import { AlbumActionsView, ActionsConfig } from '../AlbumActionsView/AlbumActionsView';
import { SEARCH } from '../../../routes';
import './AlbumView.scss';

type AlbumViewProps = {
  album: Album;
  isCurrent: boolean;
  currentTrackId: Track['_id'];
  dragType: string;
  albumActions?: ActionsConfig[];
  onContextMenu: Function;
  onDoubleClick: Function;
}

type Palette = {
  DarkMuted: string;
  DarkVibrant: string;
  Muted: string;
  Vibrant: string;
  LightMuted: string;
  LightVibrant: string;
}

// #TODO push notFoundAction
export const AlbumView: FC<AlbumViewProps> = ({
  album,
  isCurrent = false,
  currentTrackId,
  dragType,
  albumActions,
  onContextMenu,
  onDoubleClick
}) => {
  const [palette, setPalette] = useState({} as Palette);
  const { _id, type, year, artist, title } = album;
  const [viewRef, inView] = useInView({ triggerOnce: true });

  const {
    tracklist,
    cover
  } = useSelector((state: ApplicationState) => getAlbumContentById(state, _id));

  const dispatch = useDispatch();
  useEffect(() => {
    inView && dispatch(getAlbumRequest(_id));
  }, [_id, inView]);

  const [{ opacity }, drag] = useDrag({
    item: {
      type: dragType,
      _id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  function onCoverDoubleClick(album: Album): void {
    onDoubleClick(album);
  }

  function onTrackDoubleClick(track: Track): void {
    onDoubleClick(album, track);
  }

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album);
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
      DarkMuted: DarkMuted.getHex(),
      DarkVibrant: DarkVibrant.getHex(),
      Muted: Muted.getHex(),
      Vibrant: Vibrant.getHex(),
      LightMuted: LightMuted.getHex(),
      LightVibrant: LightVibrant.getHex()
    });
  }

  function renderArtist(): ReactElement {
    return <Link
      to={`${generatePath(SEARCH)}?query=artist: ${artist}`}
      className="album-artist-link">
        {artist === VARIOUS_ARTISTS_ID ? 'V/A' : artist}
      </Link>;
  }

  const showTrackNumbers = [
    AlbumTypes.Remix,
    AlbumTypes.Various
  ].indexOf(type) < 0;

  const albumClasses = cx('album-view', { 'is-current': isCurrent });
  const tagClasses = cx('album-type', `album-type-${type}`);
  const showArtists = artist === VARIOUS_ARTISTS_ID || type === AlbumTypes.Remix;
  return (
    <article className={albumClasses} id={_id} onContextMenu={_onContextMenu} ref={viewRef}>
      <aside className="album-aside" style={{ backgroundColor: palette.DarkMuted }}>
        <div ref={drag} style={{ opacity }}>
          <CoverView
            className="album-cover"
            src={cover}
            album={album}
            onImageLoad={onImageLoad}
            onDoubleClick={onCoverDoubleClick}/>
          </div>
        <header>
          <h2 style={{ color: palette.LightVibrant }}>{title}</h2>
          <p className="album-artist">{renderArtist()}</p>
          <p className="album-info">{year ? `${year} - ` : null}<span className={tagClasses}>{type}</span></p>
        </header>
        { albumActions.length > 0 && <AlbumActionsView album={album} actions={albumActions}/>}
      </aside>
      <section className="album-content">
        <TracklistView
          currentTrackId={currentTrackId}
          showArtists={showArtists}
          showTrackNumbers={showTrackNumbers}
          rawTracks={album.tracks}
          tracklist={tracklist}
          onTrackDoubleClick={onTrackDoubleClick}/>
      </section>
    </article>
  );
}
