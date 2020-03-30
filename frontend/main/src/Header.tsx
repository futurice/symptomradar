import React from 'react';
import styled from 'styled-components';
import { Link } from '@reach/router';
import Logo from './oiretutka-logo-gradient.svg';

const AppHeader = styled.header`
  padding: 24px;
  background-color: #fff;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Select = styled.select`
  margin: 0;
`;

const Header = () => {
  return (
    <AppHeader>
      <img src={Logo} alt="Oiretutka. Helsingin Sanomat ja Futurice." />
      <Nav>
        <Link to="/">About</Link>
        <Link to="map">Map</Link>
        <Select name="language" id="">
          <option value="Fi">Fi</option>
          <option value="En">En</option>
        </Select>
      </Nav>
    </AppHeader>
  );
};

export default Header;
