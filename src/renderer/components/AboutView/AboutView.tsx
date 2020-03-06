import React, { ReactElement, FC, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import './AboutView.scss';

type AboutViewProps = {
  name: string;
  description: string;
  version: string;
  homepage: string;
  repository: string;
  tos: string;
  onLinkClick: Function;
}

export const AboutView: FC<AboutViewProps> = ({
  name,
  description,
  version,
  homepage,
  repository,
  tos,
  onLinkClick
}): ReactElement => {
  const { t } = useTranslation();

  function _onClick(event: SyntheticEvent): void {
    event.preventDefault();
    onLinkClick((event.currentTarget as HTMLAnchorElement).href);
  }

  return (
    <section className="about">
      <header>
        <h1>{name}</h1>
        <p>{description}</p>
        <p className="version">{t('about.version', { version })}</p>
      </header>
      <ul className="links">
        <li>
          <a href={homepage} onClick={_onClick}>{t('about.links.homepage')}</a>
        </li>
        <li>
          <a href={repository} onClick={_onClick}>{t('about.links.repository')}</a>
        </li>
        <li>
          <a href={tos} onClick={_onClick}>{t('about.links.tos')}</a>
        </li>
      </ul>
    </section>
  );
}
