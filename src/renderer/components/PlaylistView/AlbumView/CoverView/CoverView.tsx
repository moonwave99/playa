import React, { FC, useState } from 'react';
import cx from 'classnames';
import './CoverView.scss';

type CoverViewProps = {
  src: string;
  title: string;
}

// #TODO reload onClick if some tracks are not found
export const CoverView: FC<CoverViewProps> = ({
  src,
  title
}) => {
  const [loaded, setLoaded] = useState(false);
  function onImageLoad(): void {
    setLoaded(true);
  }
  const classNames = cx('album-cover', { loaded })
  return (
    <figure className={classNames}>
      <img
        onLoad={onImageLoad}
        src={src}
        title={title}/>
    </figure>
  );
}
