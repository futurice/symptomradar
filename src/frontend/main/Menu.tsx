import React from 'react';
import { Link, Match } from '@reach/router';
import styled from 'styled-components';
import AboutIcon from './assets/AboutIcon';
import MapIcon from './assets/MapIcon';
import SurveyIcon from './assets/SurveyIcon';
import CloseIcon from './assets/CloseIcon';
import { HEADERHEIGHT } from './constants';

type MenuProps = {
  menuOpen: boolean;
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

const menuBreakpoint = '600px';

const MenuContainer = styled.div`
  width: 100vw;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  top: -${HEADERHEIGHT}px;

  @media (min-width: ${menuBreakpoint}) {
    top: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100vw;
  height: 100vh;
  background-color: ${props => props.theme.black};
  opacity: 0.6;

  @media (min-width: ${menuBreakpoint}) {
    display: none;
  }
`;

const StyledMenu = styled.nav<MenuProps>`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.white};
  height: 100vh;
  width: 90vw;
  max-width: 324px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: ${props => (props.menuOpen ? 'flex' : 'none')};

  @media (min-width: ${menuBreakpoint}) {
    height: auto;
    width: 324px;
    top: -1px;
    border: 1px solid ${props => props.theme.black};
  }
`;

const MenuHeader = styled.div`
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.black};
  height: 64px;
  display: flex;
  align-items: center;
  padding-left: 8px;

  @media (min-width: ${menuBreakpoint}) {
    display: none;
  }
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

const Menu = ({ menuOpen, setMenuOpen }: MenuProps) => {
  const isHidden = menuOpen ? true : false;
  return (
    <MenuContainer>
      {menuOpen && <Overlay onClick={() => setMenuOpen(false)} />}
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
        </MenuContent>
      </StyledMenu>
    </MenuContainer>
  );
};
export default Menu;
