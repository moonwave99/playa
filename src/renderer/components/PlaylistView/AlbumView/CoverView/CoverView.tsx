import React, { FC, useState } from 'react';
import cx from 'classnames';
import { Album } from '../../../../store/modules/album';

type CoverViewProps = {
  className?: string;
  src: string;
  album: Album;
  onContextMenu?: Function;
}

// #TODO reload onClick if some tracks are not found
export const CoverView: FC<CoverViewProps> = ({
  className,
  src,
  album,
  onContextMenu
}) => {
  const [loaded, setLoaded] = useState(false);

  function formatCoverTitle(): string {
    if (!album) {
      return '';
    }
    const { _id, artist, title } = album;
    return `[${_id}] ${artist} - ${title}`;
  }

  function onImageLoad(): void {
    setLoaded(true);
  }

  function onFigureContextMenu(): void {
    onContextMenu && onContextMenu(album);
  }
  const figureClassNames = cx(className, { loaded });
  const imageClassNames = cx({ empty: !src });

  return (
    <figure className={figureClassNames} title={formatCoverTitle()} onContextMenu={onFigureContextMenu}>
      <img
        className={imageClassNames}
        onLoad={onImageLoad}
        src={src}/>
    </figure>
  );
}
