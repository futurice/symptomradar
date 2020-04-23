import React from 'react';
import { Link, Match } from '@reach/router';
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
  setMenuOpen: any;
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

  &:not(:last-child) {
    margin-right: 10px;
  }

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

const Navigation = ({ setMenuOpen }: MenuProps) => (
  <NavigationContainer>
    <LinkContainer>
      <li>
        <LinkItem
          to="/"
          linkText="Kartta"
          setMenuOpen={setMenuOpen}
          icon={match => <MapIcon fillColor={match ? '#000' : '#0047FF'} />}
        />
      </li>
      <li>
        <LinkItem
          to="survey"
          linkText="Kyselylomake"
          setMenuOpen={setMenuOpen}
          icon={match => <SurveyIcon fillColor={match ? '#000' : '#0047FF'} />}
        />
      </li>
      <li>
        <LinkItem
          to="about"
          linkText="Info"
          setMenuOpen={setMenuOpen}
          icon={match => <AboutIcon fillColor={match ? '#000' : '#0047FF'} />}
        />
      </li>
    </LinkContainer>
  </NavigationContainer>
);

export default Navigation;
