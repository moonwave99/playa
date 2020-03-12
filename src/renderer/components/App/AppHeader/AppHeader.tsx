import React, { ReactElement, FC } from 'react';
import { useLocation, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import cx from 'classnames';
import { SearchForm } from './SearchForm/SearchForm';
import { QueueButton } from './QueueButton/QueueButton';

import './AppHeader.scss';

import {
	LIBRARY,
	PLAYLIST_ALL
} from '../../../routes';

const icons: { [key: string]: IconName } = {
	[PLAYLIST_ALL]: 'list',
	[LIBRARY]: 'music'
};

type AppHeaderProps = {
	title: string;
	hasSearchFocus: boolean;
	onSearchFormSubmit: Function;
	onSearchFormBlur: Function;
	onAddAlbumButtonClick: Function;
	onQueueButtonDrop: Function;
};

export const AppHeader: FC<AppHeaderProps> = ({
	title,
	hasSearchFocus,
	onSearchFormSubmit,
	onSearchFormBlur,
	onAddAlbumButtonClick,
	onQueueButtonDrop
}) => {
	const { t } = useTranslation();
	const location = useLocation();

	function renderButtonLink(path: string, className: string): ReactElement {
		const classNames = cx('button', 'button-frameless', 'button-mini', `button-${className}`, {
			'selected': matchPath(location.pathname, { path })
		});
		return (
			<Link to={path} className={classNames}>
				<FontAwesomeIcon icon={icons[path]} className="button-icon"/>
				<span className="button-text">{t(`buttons.${className}`)}</span>
			</Link>
		);
	}

	function _onAddAlbumButtonClick(): void {
		onAddAlbumButtonClick();
	}

	const addButtonClassNames = cx('button', 'button-full', 'button-mini', 'button-add-music', {
		visible: matchPath(location.pathname, { path: LIBRARY })
	})

	return (
		<header className="app-header">
			<div className="app-header-left-wrapper">
				{renderButtonLink(PLAYLIST_ALL, 'playlists')}
				{renderButtonLink(LIBRARY, 'library')}
				<QueueButton onDrop={onQueueButtonDrop}/>
			</div>
			<h1>{title}</h1>
			<div className="app-header-right-wrapper">
				<button className={addButtonClassNames} onClick={_onAddAlbumButtonClick}>
					<FontAwesomeIcon className="button-icon" icon="plus"/> {t('buttons.addMusic')}
				</button>
				<SearchForm
					hasFocus={hasSearchFocus}
					onFormSubmit={onSearchFormSubmit}
					onBlur={onSearchFormBlur}/>
			</div>
		</header>
	);
}
