import React, { FC, useState } from 'react';
import cx from 'classnames';
import { Album } from '../../../../store/modules/album';

type CoverViewProps = {
  className?: string;
  src: string;
  album: Album;
  onClick?: Function;
  onDoubleClick?: Function;
  onContextMenu?: Function;
  onImageLoad?: Function;
}

export const CoverView: FC<CoverViewProps> = ({
  className,
  src,
  album,
  onClick,
  onDoubleClick,
  onContextMenu,
  onImageLoad
}) => {
  const [loaded, setLoaded] = useState(false);

  function formatCoverTitle(): string {
    if (!album) {
      return '';
    }
    const { _id, artist, title } = album;
    return `Play [${_id}] ${artist} - ${title}`;
  }

  function _onImageLoad(): void {
    setLoaded(true);
    onImageLoad && onImageLoad(src);
  }

  function onFigureClick(): void {
    onClick && onClick(album);
  }

  function onFigureDoubleClick(): void {
    onDoubleClick && onDoubleClick(album);
  }

  function onFigureContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }
  const figureClassNames = cx(className, { loaded });
  const imageClassNames = cx({ empty: !src });

  return (
    <figure
      className={figureClassNames}
      title={formatCoverTitle()}
      onClick={onFigureClick}
      onDoubleClick={onFigureDoubleClick}
      onContextMenu={onFigureContextMenu}>
      <img
        className={imageClassNames}
        onLoad={_onImageLoad}
        src={src}/>
    </figure>
  );
}
