import React, { FC, useState, ChangeEvent } from 'react';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './VolumeControl.scss';

type VolumeControlProps = {
  onVolumeChange: Function;
  initialVolume?: number;
};

export const VolumeControl: FC<VolumeControlProps> = ({
  onVolumeChange,
  initialVolume = 100
}) => {
  const [volume, setVolume] = useState(initialVolume);

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const newValue = +(event.currentTarget.value);
    setVolume(newValue);
    onVolumeChange(newValue / 100);
  }

  function getIconName(): IconName{
    if (volume === 0) {
      return 'volume-off';
    }
    if (volume > 0 && volume < 75) {
      return 'volume-down';
    }
    return 'volume-up';
  }

	return (
    <div className="volume-control">
      <label htmlFor="volume">
        <FontAwesomeIcon className="volume-control-icon" icon={getIconName()} fixedWidth/>
      </label>
      <input id="volume" name="volume" type="range" defaultValue={volume} onChange={onInputChange}/>
    </div>
	);
}
