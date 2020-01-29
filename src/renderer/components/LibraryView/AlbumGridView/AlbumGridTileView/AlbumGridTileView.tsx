import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag } from 'react-dnd';
import cx from 'classnames';
import { CoverView } from '../../../AlbumListView/AlbumView/CoverView/CoverView';
import { Album } from '../../../../store/modules/album';
import { getCoverRequest, selectors as coverSelectors } from '../../../../store/modules/cover';
import { ApplicationState } from '../../../../store/store';
import { UIDragTypes } from '../../../../store/modules/ui';

type AlbumGridTileViewProps = {
  album: Album;
  isPlaying: boolean;
  onContextMenu?: Function;
  onDoubleClick?: Function;
};

export const AlbumGridTileView: FC<AlbumGridTileViewProps> = ({
  album,
  isPlaying,
  onContextMenu,
  onDoubleClick
}) => {
  const dispatch = useDispatch();
  const { _id } = album;
  const cover = useSelector((state: ApplicationState) => coverSelectors.findById(state, _id));

  const [{ opacity }, drag] = useDrag({
    item: {
      type: UIDragTypes.LIBRARY_ALBUMS,
      _id
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    })
  });

  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, [album]);

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }

  function _onDoubleClick(): void {
    onDoubleClick && onDoubleClick(album);
  }

  const classNames = cx('album-grid-tile', { 'is-playing': isPlaying});
	return (
    <article
      ref={drag}
      style={{ opacity }}
      className={classNames}
      onDoubleClick={_onDoubleClick}
      onContextMenu={_onContextMenu}>
      <CoverView
        className="album-cover"
        src={cover}
        album={album}/>
    </article>
	);
}
