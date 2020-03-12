import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

type AppHeaderProps = {
	title: string;
	onAddAlbumButtonClick: Function;
};

export const AppHeader: FC<AppHeaderProps> = ({
	title,
	onAddAlbumButtonClick
}) => {
	const { t } = useTranslation();
	function _onAddAlbumButtonClick(): void {
		onAddAlbumButtonClick();
	}
	return (
		<header className="app-header">
			<div className="search-wrapper"></div>
			<h1>{title}</h1>
			<button className="button button-mini button-add-album" onClick={_onAddAlbumButtonClick}>
        <FontAwesomeIcon className="button-icon" icon="plus"/> {t('library.buttons.addNewAlbum')}
      </button>
		</header>
	);
}
