import React, { ReactElement, FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { Album } from '../../../store/modules/album';
import './AlbumActionsView.scss';

export type ActionsConfig = {
  icon: IconName;
  handler: Function;
  title: string;
}

type AlbumActionsViewProps = {
  album: Album;
  actions: ActionsConfig[];
}

export const AlbumActionsView: FC<AlbumActionsViewProps> = ({
  album,
  actions = []
}) => {
  function renderButton({
    icon,
    handler,
    title
  }: ActionsConfig, index: number): ReactElement {
    function onClick(): void {
      handler(album);
    }
    return (
      <button
        key={index}
        title={title}
        className="album-actions-button"
        onClick={onClick}>
        <FontAwesomeIcon className="icon" icon={icon}/>
      </button>
    );
  }

  return (
    <div className="album-actions">
      {actions.map(renderButton)}
    </div>
  );
}
