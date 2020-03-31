import React from 'react';
import styled from 'styled-components';
import { Link, Match } from '@reach/router';
import Logo from './assets/oiretutka-logo-gradient.svg';
import { ReactComponent as AboutIcon } from './assets/about-icon.svg';
import { ReactComponent as MapIcon } from './assets/map-icon.svg';

type LinkProps = {
  to: string;
  linkText: string;
  children: any;
};

interface activeLinkProps {
  readonly isActive: boolean;
}

const AppHeader = styled.header`
  padding: 24px 24px 16px;
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

const LinkWrapper = styled.div<activeLinkProps>`
  display: inline-block;
  color: ${props => (props.isActive ? '#0047FF' : '#000')};
`;

const RouterLink = styled(Link)`
  padding: 6px;
  margin-right: 16px;
  text-decoration: none;
  color: inherit;

  &:active {
    color: inherit;
  }
`;

const LinkText = styled.span<activeLinkProps>`
  margin-left: 4px;
  text-decoration: ${props => (props.isActive ? 'underline' : 'none')};
`;

const LinkComponent = ({ to, linkText, children }: LinkProps) => {
  return (
    <Match path={to}>
      {({ match }) => (
        <LinkWrapper isActive={match ? true : false}>
          <RouterLink to={to}>
            {children}
            <LinkText isActive={match ? true : false}>{linkText}</LinkText>
          </RouterLink>
        </LinkWrapper>
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
          <LinkComponent to="about" linkText="About">
            <AboutIcon style={{ fill: '#000' }} />{' '}
          </LinkComponent>
          <LinkComponent to="/" linkText="Map">
            <MapIcon style={{ fill: '#000' }} />{' '}
          </LinkComponent>
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
