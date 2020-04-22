import React from 'react';
import styled from 'styled-components';
import MenuIcon from './assets/MenuIcon';

type MenuProps = {
  menuOpen: boolean;
  setMenuOpen?: any;
};

const StyledBurger = styled.button<MenuProps>`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  background: transparent;
  border: none;
  cursor: pointer;

  svg {
    width: 24px;
    margin-bottom: 4px;
  }
`;

const MenuLabel = styled.span`
  font-size: 14px;
`;

const MenuButton = ({ menuOpen, setMenuOpen }: MenuProps) => {
  return (
    <StyledBurger
      aria-label="Avaa/sulje valikko"
      aria-controls="main-menu"
      aria-expanded={menuOpen}
      menuOpen={menuOpen}
      onClick={() => setMenuOpen(!menuOpen)}
    >
      <MenuIcon></MenuIcon>
      <MenuLabel>Menu</MenuLabel>
    </StyledBurger>
  );
};

export default MenuButton;