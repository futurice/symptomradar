import React from 'react';
import styled from 'styled-components';
import { Link, Match } from '@reach/router';
import Logo from './assets/oiretutka-logo-gradient.svg';
import AboutIcon from './assets/AboutIcon';
import MapIcon from './assets/MapIcon';
import SurveyIcon from './assets/SurveyIcon';

type LinkProps = {
  to: string;
  linkText: string;
  icon: (match: { uri: string; path: string } | null) => void;
};

type HeaderProps = {
  location: string;
};

interface activeLinkProps {
  readonly isActive: boolean;
}

const AppHeader = styled.header`
  padding: 24px 16px 10px 16px;
  background-color: ${props => props.theme.white};
  border-bottom: 1px solid ${props => props.theme.black};
  height: 130px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  max-width: 600px;
  margin: 0 auto;
`;

const LogoImage = styled.img`
  height: auto;
  width: 154px;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const LinkContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const RouterLink = styled(Link)`
  padding: 6px 6px 6px 0;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;

  &:not(:last-child) {
    margin-right: 10px;
  }

  svg {
    flex: 1 0 16px;
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
  flex: 0 0 auto;

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

const Header = ({ location }: HeaderProps) => {
  const isEmbedView = location === '/map-embed';
  if (!isEmbedView) {
    return (
      <AppHeader>
        <HeaderContainer>
          <div>
            <LogoImage src={Logo} alt="Oiretutka. Helsingin Sanomat ja Futurice." />
          </div>
          <Nav>
            <LinkContainer>
              <LinkItem to="/" linkText="Kartta" icon={match => <MapIcon fillColor={match ? '#000' : '#0047FF'} />} />
              <LinkItem
                to="survey"
                linkText="Kyselylomake"
                icon={match => <SurveyIcon fillColor={match ? '#000' : '#0047FF'} />}
              />
              <LinkItem
                to="about"
                linkText="Info"
                icon={match => <AboutIcon fillColor={match ? '#000' : '#0047FF'} />}
              />
            </LinkContainer>
          </Nav>
        </HeaderContainer>
      </AppHeader>
    );
  } else {
    return null;
  }
};

export default Header;
