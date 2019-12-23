import React, { useRef, SyntheticEvent, FC } from 'react';

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
			<div className="row">
				<input type="search" ref={inputRef} placeholder="Search for..." className="column column-75" />
				<button type="submit" className="button-primary column column-25">Search...</button>
			</div>
		</form>
	);
}
