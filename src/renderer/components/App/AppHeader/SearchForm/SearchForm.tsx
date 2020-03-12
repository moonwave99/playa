import React, { SyntheticEvent, FC, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import './SearchForm.scss';

type SearchFormProps = {
	hasFocus?: boolean;
	onFormSubmit: Function;
	onBlur: Function;
};

export const SearchForm: FC<SearchFormProps> = ({
	hasFocus = false,
	onFormSubmit,
	onBlur
}) => {
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);
	const _onFormSubmit = (event: SyntheticEvent): void => {
		event.preventDefault();
		onFormSubmit(inputRef.current.value);
	};

	useEffect(() => {
		hasFocus && inputRef.current.focus();
	}, [hasFocus]);

	function _onFocus(): void {
		inputRef.current.select();
	}

	function _onBlur(): void {
		onBlur && onBlur();
	}

	const classNames = cx('search-form', { 'has-focus' : hasFocus });
	return (
		<form className={classNames} onSubmit={_onFormSubmit}>
			<input
				required
				type="search"
				onFocus={_onFocus}
				onBlur={_onBlur}
				ref={inputRef}
				placeholder={t('search.form.placeholder')}
				className="search-input mini"
				data-key-catch="Space"/>
			<button type="submit" className="button button-mini button-outline button-search">
				<FontAwesomeIcon icon="search" className="button-icon"/>
			</button>
		</form>
	);
}
