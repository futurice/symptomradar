import React from 'react';
import styled from 'styled-components';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import CloseIcon from './assets/CloseIcon';
import Navigation from './Navigation';

type MenuProps = {
  menuOpen: boolean;
  setMenuOpen?: any;
};

const MenuContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.white};
  height: 100vh;
  width: 90vw;
  max-width: 324px;
  position: absolute;
  right: 0;
  padding: 0;
  margin: 0;
`;

const MenuHeader = styled.div`
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.black};
  height: 64px;
  display: flex;
  align-items: center;
  padding-left: 8px;
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

const Menu = ({ menuOpen, setMenuOpen }: MenuProps) => {
  return (
    <DialogOverlay isOpen={menuOpen} onDismiss={() => setMenuOpen(false)}>
      <MenuContent aria-label="blee" id="main-menu">
        <MenuHeader>
          <CloseButton type="button" aria-label="Sulje" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
            Sulje
          </CloseButton>
        </MenuHeader>
        <Navigation setMenuOpen={setMenuOpen}></Navigation>
      </MenuContent>
    </DialogOverlay>
  );
};
export default Menu;
