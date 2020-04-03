import React, { ReactElement, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TooltipArg } from 'react-popper-tooltip';
import cx from 'classnames';
import { TracklistView } from '../AlbumListView/AlbumView/TracklistView/TracklistView'
import { Album, getAlbumRequest, getAlbumContentById } from '../../store/modules/album';
import { Track } from '../../store/modules/track';
import { ApplicationState } from '../../store/store';
import { showTrackNumbers } from '../../utils/albumUtils';

import './TooltipAlbumView.scss';

type TooltipAlbumViewProps = TooltipArg & {
  album: Album;
  currentTrackId: Track['_id'];
  onDoubleClick: Function;
}

export const TooltipAlbumView: FC<TooltipAlbumViewProps> = ({
  album,
  currentTrackId,
  onDoubleClick,
  getTooltipProps,
  getArrowProps,
  tooltipRef,
  arrowRef,
  placement
}) => {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const { _id } = album;

  const { tracks, artist } = useSelector((state: ApplicationState) => getAlbumContentById(state, _id));

  useEffect(() => {
    dispatch(getAlbumRequest(_id));
  }, []);

  useEffect(() => {
    setLoaded(tracks.length > 0);
  }, [tracks.length]);

  function onTrackDoubleClick(track: Track): void {
    onDoubleClick(album, artist, track);
  }

  function renderTracklist(): ReactElement {
    return (
      <TracklistView
        currentTrackId={currentTrackId}
        showArtists={false}
        showTrackNumbers={showTrackNumbers(album)}
        onTrackDoubleClick={onTrackDoubleClick}
        tracklist={album.tracks}
        tracks={tracks}
      />
    );
  }

  const classNames = cx(
    'tooltip-container',
    'tooltip-album-view',
    { loaded }
  );

  return (
    <div className={classNames}
      {...getTooltipProps({
        ref: tooltipRef
      })}>
      <div className="tooltip-arrow"
        {...getArrowProps({
          ref: arrowRef,
          'data-placement': placement
        })}/>
      <div className="tooltip-body">
        { renderTracklist() }
      </div>
    </div>
  );
}
