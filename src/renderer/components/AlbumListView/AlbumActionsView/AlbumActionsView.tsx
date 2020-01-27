import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Album } from '../../../store/modules/album';
import { AlbumActions } from '../../../actions/albumActions';
import { PlaylistContentActions } from '../../../actions/playlistContentActions';

type AlbumActionsViewProps = {
  album: Album;
  albumActionHandler: Function;
}

export const AlbumActionsView: FC<AlbumActionsViewProps> = ({
  album,
  albumActionHandler
}) => {

  function onRevealButtonClick(): void {
    albumActionHandler(AlbumActions.REVEAL_IN_FINDER, album);
  }

  function onRemoveButtonClick(): void {
    albumActionHandler(PlaylistContentActions.REMOVE_ALBUM, album);
  }

  return (
    <div className="album-actions">
      <button className="album-actions-button" onClick={onRevealButtonClick}>
        <FontAwesomeIcon className="icon" icon="folder-open"/>
      </button>
      <button className="album-actions-button" onClick={onRemoveButtonClick}>
        <FontAwesomeIcon className="icon" icon="minus-circle"/>
      </button>
    </div>
  );
}
