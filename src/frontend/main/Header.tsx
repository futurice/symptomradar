import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import Logo from './assets/oiretutka-logo-gradient.svg';
import MenuButton from './MenuButton';

type HeaderProps = {
  location: string;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
};

const AppHeader = styled.header`
  padding: 16px 16px 10px 16px;
  background-color: ${props => props.theme.white};
  border-bottom: 1px solid ${props => props.theme.grey};
  height: ${({ theme }) => theme.headerHeight}px;
`;

const HeaderContainer = styled.div`
  position: relative;
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

const Header = ({ location, menuOpen, setMenuOpen }: HeaderProps) => {
  const isEmbedView = location === '/map-embed';
  if (!isEmbedView) {
    return (
      <AppHeader>
        <HeaderContainer>
          <div>
            <Link to={'/'}>
              <LogoImage src={Logo} alt="Oiretutka. Helsingin Sanomat ja Futurice." />
            </Link>
          </div>
          <MenuButton menuOpen={menuOpen} setMenuOpen={setMenuOpen}></MenuButton>
        </HeaderContainer>
      </AppHeader>
    );
  } else {
    return null;
  }
};

export default Header;
