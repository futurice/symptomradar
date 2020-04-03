import React from 'react';
import styled from 'styled-components';
import { Link, Match } from '@reach/router';
import Logo from './assets/oiretutka-logo-gradient.svg';
import AboutIcon from './assets/AboutIcon';
import MapIcon from './assets/MapIcon';

type LinkProps = {
  to: string;
  linkText: string;
  icon: (match: { uri: string; path: string } | null) => void;
};

interface activeLinkProps {
  readonly isActive: boolean;
}

const AppHeader = styled.header`
  padding: 24px 24px 10px;
  border-bottom: 1px solid #000;
  height: 130px;
`;

const HeaderContainer = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  max-width: 600px;
  margin: 0 auto;
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

const LinkContainer = styled.div`
  display: flex;
`;

const Select = styled.select`
  margin: 0;
`;

const RouterLink = styled(Link)`
  padding: 6px 6px 6px 0;
  margin-right: 16px;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;

  &:active {
    color: inherit;
  }
`;

const LinkText = styled.span<activeLinkProps>`
  margin-left: 4px;
  font-weight: bold;
  color: ${props => (props.isActive ? '#000' : '#0047FF')};
  text-decoration: ${props => (props.isActive ? 'none' : 'underline')};

  &:hover {
    text-decoration: underline;
  }
`;

const LinkItem = ({ to, linkText, icon }: LinkProps) => {
  return (
    <Match path={to}>
      {({ match }) => (
        <RouterLink to={to}>
          {icon(match)}
          <LinkText isActive={match ? true : false}>{linkText}</LinkText>
        </RouterLink>
      )}
    </Match>
  );
};

const Header = () => {
  return (
    <AppHeader>
      <HeaderContainer>
        <div>
          <LogoImage src={Logo} alt="Oiretutka. Helsingin Sanomat ja Futurice." />
        </div>
        <Nav>
          <LinkContainer>
            <LinkItem
              to="about"
              linkText="Tutustu"
              icon={match => <AboutIcon fillColor={match ? '#000' : '#0047FF'} />}
            />
            <LinkItem
              to="/"
              linkText="Kartta"
              icon={(match: { uri: string; path: string } | null) => <MapIcon fillColor={match ? '#000' : '#0047FF'} />}
            />
            <LinkItem
              to="survey"
              linkText="Vastaa kyselyyn"
              icon={match => <AboutIcon fillColor={match ? '#000' : '#0047FF'} />}
            />
          </LinkContainer>
          <Select name="language" id="">
            <option value="Fi">Fi</option>
            <option value="En">En</option>
          </Select>
        </Nav>
      </HeaderContainer>
    </AppHeader>
  );
};

export default Header;
