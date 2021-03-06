import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import CloseIcon from './assets/CloseIcon';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';

type ModalProps = {
  isShowing: boolean;
  hide: () => void;
  ariaLabel: string;
  positionBottom?: boolean;
};

const ModalOverlay = styled(DialogOverlay)<{ positionBottom?: boolean }>`
  display: flex;
  align-items: ${({ positionBottom = false }) => (positionBottom ? 'flex-end' : 'center')};
  justify-content: center;
`;

const ModalDialogContent = styled(DialogContent)`
  padding: 24px 18px 24px;
  position: relative;
  width: 100%;
  max-width: 95vw;
  margin: 2vh 0;

  @media (min-width: 520px) {
    max-width: 500px;
  }
`;

const ModalCloseButton = styled.button`
  padding: 16px 16px 12px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  position: absolute;
  right: 8px;
  top: 12px;
  z-index: 1;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Modal: React.FC<ModalProps> = ({ isShowing, hide, children, ariaLabel, positionBottom = false }) => {
  const { t } = useTranslation(['main']);
  return (
    <ModalOverlay isOpen={isShowing} onDismiss={hide} positionBottom={positionBottom}>
      <ModalDialogContent aria-label={ariaLabel}>
        <ModalCloseButton type="button" aria-label={t('main:close')} onClick={hide}>
          <CloseIcon />
        </ModalCloseButton>
        {children}
      </ModalDialogContent>
    </ModalOverlay>
  );
};

export default Modal;
