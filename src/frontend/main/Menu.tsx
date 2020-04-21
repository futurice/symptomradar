import React from 'react';
import { Link, Match } from '@reach/router';
import styled from 'styled-components';
import AboutIcon from './assets/AboutIcon';
import MapIcon from './assets/MapIcon';
import SurveyIcon from './assets/SurveyIcon';
import CloseIcon from './assets/CloseIcon';

type MenuProps = {
  menuOpen: boolean;
  setMenuOpen?: any;
};

type LinkProps = {
  to: string;
  linkText: string;
  icon: (match: { uri: string; path: string } | null) => void;
  tabIndex: any;
  setMenuOpen: any;
};

interface activeLinkProps {
  readonly isActive: boolean;
}

const StyledMenu = styled.nav<MenuProps>`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.white};
  height: 100vh;
  width: 90vw;
  position: absolute;
  top: 0;
  right: 0;
  transition: transform 0.3s ease-in-out;
  z-index: 1;
  transform: ${props => (props.menuOpen ? 'translateX(0)' : 'translateX(100%)')};
`;

const MenuHeader = styled.div`
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.black};
  height: 64px;
  display: flex;
  align-items: center;
  padding-left: 8px;
`;

const MenuContent = styled.div`
  padding: 24px 42px;
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

const CloseButton = styled.button`
  padding: 16px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  z-index: 1;
  font-size: 14px;
  display: flex;

  svg {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
`;

const LinkItem = ({ to, linkText, icon, tabIndex, setMenuOpen }: LinkProps) => {
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

const Menu = ({ menuOpen, setMenuOpen }: MenuProps) => {
  const isHidden = menuOpen ? true : false;
  const tabIndex = isHidden ? 0 : -1;
  return (
    <StyledMenu menuOpen={menuOpen} id="main-menu" aria-hidden={!isHidden}>
      <MenuHeader>
        <CloseButton type="button" aria-label="Sulje" onClick={() => setMenuOpen(false)}>
          <CloseIcon />
          Sulje
        </CloseButton>
      </MenuHeader>
      <MenuContent>
        <LinkContainer>
          <li>
            <LinkItem
              tabIndex={tabIndex}
              to="/"
              linkText="Kartta"
              setMenuOpen={setMenuOpen}
              icon={match => <MapIcon fillColor={match ? '#000' : '#0047FF'} />}
            />
          </li>
          <li>
            <LinkItem
              tabIndex={tabIndex}
              to="survey"
              linkText="Kyselylomake"
              setMenuOpen={setMenuOpen}
              icon={match => <SurveyIcon fillColor={match ? '#000' : '#0047FF'} />}
            />
          </li>
          <li>
            <LinkItem
              tabIndex={tabIndex}
              to="about"
              linkText="Info"
              setMenuOpen={setMenuOpen}
              icon={match => <AboutIcon fillColor={match ? '#000' : '#0047FF'} />}
            />
          </li>
        </LinkContainer>
      </MenuContent>
    </StyledMenu>
  );
};
export default Menu;
