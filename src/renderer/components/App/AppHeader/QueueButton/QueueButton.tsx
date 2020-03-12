import React, { FC } from 'react';
import { useLocation, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { QUEUE } from '../../../../routes';
import { UIDragTypes, UIDropItem } from '../../../../store/modules/ui';

type QueueButtonProps = {
  onDrop: Function;
}

export const QueueButton: FC<QueueButtonProps> = ({
  onDrop
}) => {
	const { t } = useTranslation();
	const location = useLocation();
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [
      UIDragTypes.SEARCH_RESULTS,
      UIDragTypes.LIBRARY_ALBUMS,
      UIDragTypes.PLAYLIST_ALBUMS
    ],
    drop: ({ selection }: UIDropItem) => onDrop(selection),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const classNames = cx('button', 'button-mini', 'button-queue', {
    'button-outline': !matchPath(location.pathname, { path: QUEUE }),
    'drag-is-over': isOver,
    'drag-can-drop': canDrop
  });

  return (
    <div ref={drop} className="button-drag-wrapper">
      <Link to={QUEUE} className={classNames}>
        <FontAwesomeIcon icon="play" className="button-icon"/>
        <span className="button-text">{t('buttons.queue')}</span>
      </Link>
    </div>
  );
}
