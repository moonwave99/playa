import React, { FC } from 'react';
import { TooltipArg } from 'react-popper-tooltip';
import cx from 'classnames';
import { Playlist } from '../../store/modules/playlist';
import { formatDate } from '../../utils/datetimeUtils';
import { DATE_FORMATS } from '../../../constants';

import './TooltipPlaylistView.scss';

type TooltipPlaylistViewProps = TooltipArg & {
  playlist: Playlist;
}

export const TooltipPlaylistView: FC<TooltipPlaylistViewProps> = ({
  playlist,
  getTooltipProps,
  getArrowProps,
  tooltipRef,
  arrowRef,
  placement
}) => {

  const { created } = playlist;

  const classNames = cx(
    'tooltip-container',
    'tooltip-playlist-view'
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
        <p className="playlist-date">
          {formatDate({ date: created, options: DATE_FORMATS.DEFAULT })}
        </p>
      </div>
    </div>
  );
}
