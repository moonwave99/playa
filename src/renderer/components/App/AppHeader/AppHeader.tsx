import React, { ReactElement, FC } from 'react';
import { Switch, Route, } from 'react-router';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { SearchForm } from './SearchForm/SearchForm';
import { QueueButton } from './QueueButton/QueueButton';
import { PlaylistTitle } from './PlaylistTitle/PlaylistTitle';
import { ActionDropdown, ActionDropdownAction } from '../../ActionDropdown/ActionDropdown';

import './AppHeader.scss';

import {
	LIBRARY,
	PLAYLIST_ALL,
	PLAYLIST_SHOW
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

	function renderButtonLink(path: string, className: string): ReactElement {
		const classNames = [
			'button',
			'button-frameless',
			'button-vertical',
			`button-${className}`
		].join(' ');
		return (
			<NavLink to={path} className={classNames} activeClassName="selected">
				<FontAwesomeIcon icon={icons[path]} className="button-icon"/>
				<span className="button-text">{t(`buttons.${className}`)}</span>
			</NavLink>
		);
	}

	function renderDropDown(actions: ActionDropdownAction[]): ReactElement {
		return (
			<ActionDropdown
				className="app-header-action-dropdown"
				actions={actions}/>
		);
	}

	const actions: { [key: string]: ActionDropdownAction[]} = {
		library: [
			{
				id: 'library-add-music',
				label: t('buttons.addMusic'),
				icon: 'plus',
				handler: onAddAlbumButtonClick
			}
		]
	};

	return (
		<header className="app-header">
			<div className="app-header-left-wrapper">
				{renderButtonLink(PLAYLIST_ALL, 'playlists')}
				{renderButtonLink(LIBRARY, 'library')}
				<QueueButton
					className="button-vertical"
					onDrop={onQueueButtonDrop}/>
			</div>
			<div className="app-header-middle-wrapper">
				<Switch>
					<Route path={PLAYLIST_ALL} exact>
						<h1>{title}</h1>
					</Route>
					<Route path={PLAYLIST_SHOW} exact>
						<PlaylistTitle/>
					</Route>
					<Route>
						<h1>{title}</h1>
					</Route>
				</Switch>
			</div>
			<div className="app-header-right-wrapper">
				<Switch>
					<Route path={LIBRARY} exact>
						{renderDropDown(actions.library)}
					</Route>
				</Switch>
				<SearchForm
					hasFocus={hasSearchFocus}
					onFormSubmit={onSearchFormSubmit}
					onBlur={onSearchFormBlur}/>
			</div>
		</header>
	);
}
