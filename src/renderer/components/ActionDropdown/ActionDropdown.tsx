import React, { ReactElement, FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { Button, Wrapper, Menu, MenuItem } from 'react-aria-menubutton';
import cx from 'classnames';

import './ActionDropdown.scss';

export type ActionDropdownAction = {
  id: string;
  label: string;
  icon: IconName;
  handler: Function;
};

type ActionDropdownProps = {
  className?: string;
  triggerIcon?: IconName;
  actions: ActionDropdownAction[];
};

export const ActionDropdown: FC<ActionDropdownProps> = ({
  actions = [],
  triggerIcon = 'chevron-down',
  className
}) => {

  function onSelection(value: string): void {
    const { handler } = actions.find(({ id }) => id === value);
    handler && handler();
  }

  function renderActionItem(
    { label, icon, id }: ActionDropdownAction,
    index: number
  ): ReactElement {
    const classNames = cx('action-dropdown-item', id);
    return (
      <MenuItem
        key={index}
        value={id}
        text={label}
        tag='li'
        className={classNames}>
        <FontAwesomeIcon
          className="action-dropdown-item-icon"
          icon={icon} fixedWidth/>
        {label}
      </MenuItem>
    );
  }

  const classNames = cx('action-dropdown', className);

  return (
    <Wrapper className={classNames} onSelection={onSelection}>
      <Button tag="button" className="action-dropdown-trigger button button-mini button-frameless">
        <FontAwesomeIcon icon={triggerIcon}/>
      </Button>
      <Menu>
        <ul className="action-dropdown-menu">
          {actions.map(renderActionItem)}
        </ul>
      </Menu>
    </Wrapper>
  );
}
