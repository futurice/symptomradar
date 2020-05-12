import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import MenuIcon from './assets/MenuIcon';

type MenuProps = {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
};

const StyledBurger = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  padding: 4px;
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
  const { t } = useTranslation(['main']);
  return (
    <StyledBurger
      aria-label={t('main:openOrCloseMenu')}
      aria-controls="main-menu"
      aria-expanded={menuOpen}
      onClick={() => setMenuOpen(!menuOpen)}
    >
      <MenuIcon></MenuIcon>
      <MenuLabel>Menu</MenuLabel>
    </StyledBurger>
  );
};

export default MenuButton;
