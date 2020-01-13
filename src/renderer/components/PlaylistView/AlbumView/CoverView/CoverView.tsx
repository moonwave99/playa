import React, { FC, useState } from 'react';
import cx from 'classnames';

type CoverViewProps = {
  className?: string;
  src: string;
  title: string;
}

// #TODO reload onClick if some tracks are not found
export const CoverView: FC<CoverViewProps> = ({
  className,
  src,
  title
}) => {
  const [loaded, setLoaded] = useState(false);
  function onImageLoad(): void {
    setLoaded(true);
  }
  const classNames = cx(className, { loaded })
  return (
    <figure className={classNames}>
      <img
        onLoad={onImageLoad}
        src={src}
        title={title}/>
    </figure>
  );
}
