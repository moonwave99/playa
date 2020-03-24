import React, { FC, ReactElement, useRef, KeyboardEvent, FormEvent } from 'react';
import cx from 'classnames';

import './EditableTitle.scss';

type EditableTitleProps = {
	title: string;
	subTitle?: string;
	className?: string;
	isEditing?: boolean;
	onTitleClick: Function;
	onSubmit: Function;
	onBlur: Function;
};

export const EditableTitle: FC<EditableTitleProps> = ({
	title,
	subTitle,
	className,
	isEditing = false,
	onTitleClick,
	onSubmit,
	onBlur
}) => {
	const inputRef = useRef<HTMLInputElement>(null);

	function onClick(): void {
		onTitleClick();
	}

	function _onSubmit(event: FormEvent): void {
		event.preventDefault();
		onSubmit(inputRef.current.value);
	}

	function _onBlur(): void {
		onBlur();
	}

	function onKeyDown(event: KeyboardEvent): void {
		const { key } = event;
		switch (key) {
			case 'Escape':
				event.preventDefault();
				onBlur();
				break;
		}
	}

	function renderForm(): ReactElement {
		const classNames = cx('edit-title-form', className);
		return (
			<form className={classNames} onSubmit={_onSubmit}>
				<input
					name="title"
					className="header-like"
					ref={inputRef}
					defaultValue={title}
					type="text"
					onKeyDown={onKeyDown}
					onBlur={_onBlur}
					required
					autoFocus
					data-key-catch="Space"/>
			</form>
		);
	}

	function renderTitle(): ReactElement {
		const classNames = cx('heading', className, {
			'heading-has-sub': subTitle
		});
		return (
			<h1 className={classNames} onClick={onClick}>
				<span className="heading-main">{title}</span>
				{ subTitle && <span className="heading-sub">{subTitle}</span>}
			</h1>
		);
	}

	return (
		isEditing
			? renderForm()
			: renderTitle()
	);
}
