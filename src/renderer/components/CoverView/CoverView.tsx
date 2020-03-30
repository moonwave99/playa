import React, { FC, useRef, MouseEvent } from 'react';
import cx from 'classnames';
import { Album } from '../../store/modules/album';

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
  const ref = useRef<HTMLDivElement>(null);
  function formatCoverTitle(): string {
    if (!album) {
      return '';
    }
    const { _id, artist, title } = album;
    return `[${_id}] ${artist} - ${title}`;
  }

  function _onImageLoad(): void {
    ref.current.classList.toggle('loaded', true);
    onImageLoad && onImageLoad(src);
  }

  function onFigureClick(event: MouseEvent): void {
    onClick && onClick(event, album);
  }

  function onFigureDoubleClick(): void {
    onDoubleClick && onDoubleClick(album);
  }

  function onFigureContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }

  const imageClassNames = cx({ empty: !src });
  const title = formatCoverTitle();
  return (
    <figure
      ref={ref}
      className={className}
      title={title}
      onClick={onFigureClick}
      onDoubleClick={onFigureDoubleClick}
      onContextMenu={onFigureContextMenu}>
      <img
        className={imageClassNames}
        onLoad={_onImageLoad}
        src={src}
        alt={title}/>
    </figure>
  );
}
