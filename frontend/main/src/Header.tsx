import React from 'react';
import styled from 'styled-components';
import { Link, Match } from '@reach/router';
import Logo from './assets/oiretutka-logo-gradient.svg';
import AboutIcon from './assets/AboutIcon';
import MapIcon from './assets/MapIcon';

type LinkProps = {
  to: string;
  linkText: string;
};

interface activeLinkProps {
  readonly isActive: boolean;
}

const AppHeader = styled.header`
  padding: 24px 24px 10px;
  background-color: #fff;
  border-bottom: 1px solid #000;
  height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
`;

const LogoImage = styled.img`
  height: 55px;
  width: auto;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Select = styled.select`
  margin: 0;
`;

const RouterLink = styled(Link)`
  padding: 6px;
  margin-right: 16px;
  text-decoration: none;
  color: inherit;
  display: inline-block;

  &:active {
    color: inherit;
  }
`;

const LinkText = styled.span<activeLinkProps>`
  margin-left: 4px;
  font-weight: bold;
  color: ${props => (props.isActive ? '#0047FF' : '#000')};
  text-decoration: ${props => (props.isActive ? 'underline' : 'none')};

  &:hover {
    text-decoration: underline;
  }
`;

const LinkItem = ({ to, linkText }: LinkProps) => {
  return (
    <Match path={to}>
      {({ match }) => (
        <RouterLink to={to}>
          {to === '/' && <MapIcon fillColor={match ? '#0047FF' : '#000'} />}
          {to === 'about' && <AboutIcon fillColor={match ? '#0047FF' : '#000'} />}
          <LinkText isActive={match ? true : false}>{linkText}</LinkText>
        </RouterLink>
      )}
    </Match>
  );
};

const Header = () => {
  return (
    <AppHeader>
      <div>
        <LogoImage src={Logo} alt="Oiretutka. Helsingin Sanomat ja Futurice." />
      </div>
      <Nav>
        <div>
          <LinkItem to="about" linkText="About" />
          <LinkItem to="/" linkText="Map" />
        </div>
        <Select name="language" id="">
          <option value="Fi">Fi</option>
          <option value="En">En</option>
        </Select>
      </Nav>
    </AppHeader>
  );
};

export default Header;
