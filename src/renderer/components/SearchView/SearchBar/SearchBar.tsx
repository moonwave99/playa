import React, { useRef, SyntheticEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SearchBar.scss';

type SearchBarProps = {
	onFormSubmit: Function;
};

export const SearchBar: FC<SearchBarProps> = ({ onFormSubmit }) => {
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);
	const _onFormSubmit = (event: SyntheticEvent): void => {
		event.preventDefault();
		onFormSubmit(inputRef.current.value);
	};
	return (
		<form className="search-bar" onSubmit={_onFormSubmit}>
			<input
				required
				autoFocus
				type="search"
				ref={inputRef}
				placeholder={t('search.form.placeholder')}
				className="search-input"
				data-key-catch="Space"/>
			<button type="submit" className="button">
				<FontAwesomeIcon icon="search" className="icon"/>
				<span className="text">{t('search.buttons.search')}</span>
			</button>
		</form>
	);
}
