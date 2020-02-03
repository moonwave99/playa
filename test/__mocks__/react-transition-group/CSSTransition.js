import * as React from 'react'

export default (props) => (
  <div>
    {props.in ? props.children() : null}
  </div>
);
