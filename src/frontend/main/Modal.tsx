import React from 'react';
import styled from 'styled-components';
import CloseIcon from './assets/CloseIcon';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';

type ModalProps = {
  isShowing: boolean;
  hide: () => void;
};

const ModalDialogContent = styled(DialogContent)`
  padding: 24px 18px 24px;
  position: relative;
  width: 100%;
  max-width: 95vw;

  @media (min-width: 520px) {
    max-width: 500px;
  }
`;

const ModalCloseButton = styled.button`
  padding: 16px;
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

const Modal: React.FC<ModalProps> = ({ isShowing, hide, children }) => {
  return (
    <DialogOverlay isOpen={isShowing} onDismiss={hide}>
      <ModalDialogContent>
        <ModalCloseButton type="button" aria-label="Sulje" onClick={hide}>
          <CloseIcon />
        </ModalCloseButton>
        {children}
      </ModalDialogContent>
    </DialogOverlay>
  );
};

export default Modal;
