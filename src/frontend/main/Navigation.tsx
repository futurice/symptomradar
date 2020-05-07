import React from 'react';
import { Link, Match } from '@reach/router';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import styled from 'styled-components';
import AboutIcon from './assets/AboutIcon';
import MapIcon from './assets/MapIcon';
import SurveyIcon from './assets/SurveyIcon';

type MenuProps = {
  setMenuOpen?: any;
};

type LinkProps = {
  to: string;
  linkText: string;
  icon: (match: { uri: string; path: string } | null) => void;
  setMenuOpen: (value: boolean) => void;
};

interface activeLinkProps {
  readonly isActive: boolean;
}

const NavigationContainer = styled.nav`
  padding: 24px 42px;
  background: ${props => props.theme.white};
`;

const LinkContainer = styled.ul`
  display: flex;
  flex-direction: column;
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const RouterLink = styled(Link)`
  padding: 6px 6px 6px 0;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  font-size: 21px;
  padding: 16px 0;

  svg {
    flex: 0 0 24px;
    width: 24px;
    height: auto;
    margin-right: 8px;
  }

  &:active {
    color: inherit;
  }
`;

const LinkText = styled.span<activeLinkProps>`
  margin-left: 4px;
  font-weight: bold;
  color: ${props => (props.isActive ? props.theme.black : props.theme.blue)};
  text-decoration: ${props => (props.isActive ? 'none' : 'underline')};

  &:hover {
    text-decoration: underline;
  }
`;

const LinkItem = ({ to, linkText, icon, setMenuOpen }: LinkProps) => {
  return (
    <Match path={to}>
      {({ match }) => (
        <RouterLink to={to} onClick={() => setMenuOpen(false)}>
          {icon(match)}
          <LinkText isActive={match ? true : false}>{linkText}</LinkText>
        </RouterLink>
      )}
    </Match>
  );
};

const Navigation = ({ setMenuOpen }: MenuProps) => {
  const { t } = useTranslation('navigation');
  const selectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18next.changeLanguage(e.target.value);
  };
  return (
    <NavigationContainer>
      <LinkContainer>
        <li>
          <select onChange={selectLanguage}>
            <option value="fi" selected={i18next.language === 'fi'}>
              Suomi
            </option>
            <option value="en" selected={i18next.language === 'en'}>
              English
            </option>
          </select>
        </li>
        <li>
          <LinkItem
            to="/"
            linkText={t('map')}
            setMenuOpen={setMenuOpen}
            icon={match => <MapIcon fillColor={match ? '#000' : '#0047FF'} />}
          />
        </li>
        <li>
          <LinkItem
            to="survey"
            linkText={t('survey')}
            setMenuOpen={setMenuOpen}
            icon={match => <SurveyIcon fillColor={match ? '#000' : '#0047FF'} />}
          />
        </li>
        <li>
          <LinkItem
            to="about"
            linkText={t('info')}
            setMenuOpen={setMenuOpen}
            icon={match => <AboutIcon fillColor={match ? '#000' : '#0047FF'} />}
          />
        </li>
      </LinkContainer>
    </NavigationContainer>
  );
};

export default Navigation;
