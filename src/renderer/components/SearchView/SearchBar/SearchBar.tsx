import React, { useRef, SyntheticEvent, FC } from 'react';
import './SearchBar.scss';

type SearchBarProps = {
	onFormSubmit: Function;
};

export const SearchBar: FC<SearchBarProps> = ({ onFormSubmit }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const _onFormSubmit = (event: SyntheticEvent): void => {
		event.preventDefault();
		onFormSubmit(inputRef.current.value);
	};
	return (
		<form className="search-bar" onSubmit={_onFormSubmit}>
			<input autoFocus type="search" ref={inputRef} placeholder="Search for..." className="search-input"/>
			<button type="submit" className="button button-primary">Search...</button>
		</form>
	);
}
