import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CoverView } from '../../../AlbumListView/AlbumView/CoverView/CoverView';
import { Album } from '../../../../store/modules/album';
import { getCoverRequest } from '../../../../store/modules/cover';

type AlbumGridTileViewProps = {
  album: Album;
  onContextMenu?: Function;
  onDoubleClick?: Function;
};

export const AlbumGridTileView: FC<AlbumGridTileViewProps> = ({
  album,
  onContextMenu,
  onDoubleClick
}) => {
  const dispatch = useDispatch();
  const { _id } = album;
  const cover = useSelector(({ covers }) => covers.allById[_id]);

  useEffect(() => {
    dispatch(getCoverRequest(album));
  }, []);

  function _onContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }

  function _onDoubleClick(): void {
    onDoubleClick && onDoubleClick(album);
  }

	return (
    <article
      className="album-grid-tile"
      onDoubleClick={_onDoubleClick}
      onContextMenu={_onContextMenu}>
      <CoverView
        className="album-cover"
        src={cover}
        album={album}/>
    </article>
	);
}
