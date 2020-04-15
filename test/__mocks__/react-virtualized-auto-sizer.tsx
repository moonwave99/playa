import * as React from 'react';
import { AutoSizerProps } from 'react-virtualized-auto-sizer';

export default (props: AutoSizerProps) => (
  <div>
    {props.children({
      width: props.defaultWidth,
      height: props.defaultHeight
    })}
  </div>
)
