import React = require('react');

export function FontAwesomeIcon({
  className,
  icon
}: {
  className: string;
  icon: string;
}) {
  return <i className={[className, `fa-${icon}`].join(' ')} />
}
