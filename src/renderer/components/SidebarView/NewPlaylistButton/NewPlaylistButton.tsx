import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { UIDragTypes, UIDropItem } from '../../../store/modules/ui';

type NewPlaylistButtonProps = {
  onClick: Function;
  onDrop: Function;
}

export const NewPlaylistButton: FC<NewPlaylistButtonProps> = ({
  onClick,
  onDrop
}) => {
  const { t } = useTranslation();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [
      UIDragTypes.SEARCH_RESULTS,
      UIDragTypes.LIBRARY_ALBUMS,
      UIDragTypes.PLAYLIST_ALBUMS,
      UIDragTypes.QUEUE_ALBUMS
    ],
    drop: ({ _id }: UIDropItem) => onDrop([_id]),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  function _onClick(): void {
    onClick();
  }

  const classNames = cx('new-playlist-button', {
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

  return (
    <button type="button" className={classNames} onClick={_onClick} ref={drop}>
      <FontAwesomeIcon icon="plus" className="icon" fixedWidth/>
      <span className="button-text">{t('sidebar.buttons.playlist.new')}</span>
    </button>
  );
};
