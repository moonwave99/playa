import React, { ReactElement, FC } from 'react';
import { useLocation, matchPath } from 'react-router';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { SearchForm } from './SearchForm/SearchForm';
import { QueueButton } from './QueueButton/QueueButton';

import './AppHeader.scss';

import {
	LIBRARY
} from '../../../routes';

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

	function renderLibraryLink(): ReactElement {
		const classNames = cx('button', 'button-mini', 'button-library', {
			'button-outline': !matchPath(location.pathname, { path: LIBRARY })
		});
		return (
			<Link to={LIBRARY} className={classNames}>
				<FontAwesomeIcon icon="music" className="button-icon"/>
				<span className="button-text">{t('buttons.library')}</span>
			</Link>
		);
	}

	function _onAddAlbumButtonClick(): void {
		onAddAlbumButtonClick();
	}

	const addButtonClassNames = cx('button', 'button-mini', 'button-add-album', {
		visible: matchPath(location.pathname, { path: LIBRARY })
	})

	return (
		<header className="app-header">
			<div className="app-header-left-wrapper">
				<SearchForm
					hasFocus={hasSearchFocus}
					onFormSubmit={onSearchFormSubmit}
					onBlur={onSearchFormBlur}/>
				{renderLibraryLink()}
				<QueueButton onDrop={onQueueButtonDrop}/>
			</div>
			<h1>{title}</h1>
			<div className="app-header-right-wrapper">
				<button className={addButtonClassNames} onClick={_onAddAlbumButtonClick}>
					<FontAwesomeIcon className="button-icon" icon="plus"/> {t('buttons.addNewAlbum')}
				</button>
			</div>
		</header>
	);
}
