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
  const figureClassNames = cx(className, { loaded });
  const imageClassNames = cx({ empty: !src });
  return (
    <figure className={figureClassNames} title={title}>
      <img
        className={imageClassNames}
        onLoad={onImageLoad}
        src={src}/>
    </figure>
  );
}
