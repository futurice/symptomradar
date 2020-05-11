import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import { useMediaQuery } from 'react-responsive';
import CloseIcon from './assets/CloseIcon';
import Navigation from './Navigation';

type MenuProps = {
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
};

type NavProps = {
  isVisible: boolean;
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

const NavigationContainer = styled.div<NavProps>`
  display: ${props => (props.isVisible ? 'block' : 'none')};
  z-index: 1;
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;

  nav {
    position: absolute;
    right: 0;
    top: -1px;
    border: 1px solid ${props => props.theme.black};
  }
`;

const MenuSmallScreen = ({ menuOpen, setMenuOpen }: MenuProps) => {
  const { t } = useTranslation(['main']);
  return (
    <DialogOverlay isOpen={menuOpen} onDismiss={() => setMenuOpen(false)}>
      <MenuContent aria-label={t('main:navigation')} id="main-menu">
        <MenuHeader>
          <CloseButton type="button" aria-label={t('main:close')} onClick={() => setMenuOpen(false)}>
            <CloseIcon />
            {t('main:close')}
          </CloseButton>
        </MenuHeader>
        <Navigation setMenuOpen={setMenuOpen}></Navigation>
      </MenuContent>
    </DialogOverlay>
  );
};

const MenuBigScreen = ({ menuOpen, setMenuOpen }: MenuProps) => {
  return (
    <NavigationContainer isVisible={menuOpen} id="main-menu">
      <Navigation setMenuOpen={setMenuOpen}></Navigation>
    </NavigationContainer>
  );
};

const Menu = ({ menuOpen, setMenuOpen }: MenuProps) => {
  const isBiggerScreen = useMediaQuery({
    query: '(min-width: 600px)',
  });

  return (
    <>
      {isBiggerScreen ? (
        <MenuBigScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      ) : (
        <MenuSmallScreen menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}
    </>
  );
};

export default Menu;
