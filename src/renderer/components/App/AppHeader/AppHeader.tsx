import React, { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { SearchForm } from './SearchForm/SearchForm';

import './AppHeader.scss';

type AppHeaderProps = {
	title: string;
	hasSearchFocus: boolean;
	onSearchFormSubmit: Function;
	onSearchFormBlur: Function;
	onAddAlbumButtonClick: Function;
};

export const AppHeader: FC<AppHeaderProps> = ({
	title,
	hasSearchFocus,
	onSearchFormSubmit,
	onSearchFormBlur,
	onAddAlbumButtonClick
}) => {
	const { t } = useTranslation();
	function _onAddAlbumButtonClick(): void {
		onAddAlbumButtonClick();
	}
	return (
		<header className="app-header">
			<div className="search-form-wrapper">
				<SearchForm
					hasFocus={hasSearchFocus}
					onFormSubmit={onSearchFormSubmit}
					onBlur={onSearchFormBlur}/>
			</div>
			<h1>{title}</h1>
			<button className="button button-mini button-add-album" onClick={_onAddAlbumButtonClick}>
        <FontAwesomeIcon className="button-icon" icon="plus"/> {t('library.buttons.addNewAlbum')}
      </button>
		</header>
	);
}
