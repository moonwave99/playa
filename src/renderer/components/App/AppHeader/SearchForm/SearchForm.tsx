import React, {
	ReactElement,
	FC,
	useRef,
	useState,
	useEffect,
	SyntheticEvent,
	ChangeEvent,
	FormEvent,
	KeyboardEvent
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Autosuggest from 'react-autosuggest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import './SearchForm.scss';

import {
  Artist,
  searchArtists,
} from '../../../../store/modules/artist';

import { ApplicationState } from '../../../../store/store';

import { SUGGESTION_LENGTH_THRESHOLD } from '../../../../../constants';

type SearchFormProps = {
	requestFocus?: boolean;
	onFormSubmit: Function;
	onBlur: Function;
};

export const SearchForm: FC<SearchFormProps> = ({
	requestFocus = false,
	onFormSubmit,
	onBlur
}) => {
	const { t } = useTranslation();
	const [suggestionQuery, setSuggestionQuery] = useState('');
	const [query, setQuery] = useState('');
	const [hasFocus, setFocus] = useState(requestFocus);
  const artistSuggestions = useSelector(
    (state: ApplicationState) => suggestionQuery.length < SUGGESTION_LENGTH_THRESHOLD
			? []
			: searchArtists(state, suggestionQuery)
  );

	const inputRef = useRef<HTMLInputElement>(null);
	const _onFormSubmit = (event: SyntheticEvent): void => {
		event.preventDefault();
		onFormSubmit(query);
	};

	useEffect(() => {
		hasFocus && inputRef.current.focus();
	}, []);

	function _onFocus(): void {
		setFocus(true);
		inputRef.current.select();
	}

	function _onBlur(): void {
		setFocus(false);
		setSuggestionQuery('');
		onBlur();
	}

	function onChange(event: ChangeEvent<HTMLInputElement>): void {
		setQuery(event.target.value);
	}

	function getSuggestionValue(artist: Artist): string {
		return artist._id;
	}

	async function onSuggestionsFetchRequested({ value }: { value: string }): Promise<void> {
		setSuggestionQuery(value);
	}

	function onSuggestionsClearRequested(): void {
		setSuggestionQuery('');
	}

	function onSuggestionSelected(
		event: FormEvent,
		{ suggestion }: { suggestion: Artist }
	): void {
		event.preventDefault();
		setQuery(suggestion.name);
		setSuggestionQuery('');
	}

	function renderSuggestion(artist: Artist): ReactElement {
		return <span>{artist.name}</span>;
	}

	function onKeyDown(event: KeyboardEvent): void {
		switch (event.key) {
			case 'Escape':
				if (artistSuggestions.length > 0) {
					event.preventDefault();
					event.stopPropagation();
				}
				break;
		}
	}

	function renderInputComponent(inputProps: object): ReactElement {
		return <input {...inputProps} ref={inputRef}/>;
	}

	const data = {
		'data-key-catch': 'Space'
	};

	const classNames = cx('search-form', {
		'has-focus' : hasFocus,
		'has-suggestions' : artistSuggestions.length >0  && suggestionQuery.length > 0
	});
	return (
		<form className={classNames} onSubmit={_onFormSubmit}>
			<Autosuggest
				suggestions={artistSuggestions}
				getSuggestionValue={getSuggestionValue}
				onSuggestionsFetchRequested={onSuggestionsFetchRequested}
				onSuggestionsClearRequested={onSuggestionsClearRequested}
				onSuggestionSelected={onSuggestionSelected}
				renderSuggestion={renderSuggestion}
				renderInputComponent={renderInputComponent}
				inputProps={{
					onChange,
					required: true,
					type: 'search',
					name: 'search',
					id: 'search',
					placeholder: t('search.form.placeholder'),
					className: "search-input mini",
					value: query,
					onKeyDown: onKeyDown,
					onFocus: _onFocus,
					onBlur: _onBlur,
					...data
				}}/>
			<button type="submit" className="button button-mini button-outline button-search">
				<FontAwesomeIcon icon="search" className="button-icon"/>
			</button>
		</form>
	);
}
