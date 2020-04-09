import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import CloseIcon from './assets/CloseIcon';
import PrimaryButton from './PrimaryButton';

type ModalProps = {
  isShowing: boolean;
  hide: () => void;
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
`;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
  pointer-events: none;
`;

const ModalContent = styled.div`
  pointer-events: auto;
  z-index: 100;
  background: white;
  padding: 24px 18px 24px;
  width: 100%;
  max-height: 90vh;
  max-width: 90vw;
  overflow: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @media (min-width: 768px) {
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

const CloseButton = styled(PrimaryButton)`
  display: block;
  margin: 40px auto 0 auto;
  min-width: 212px;
  background: #595959;
  color: #fff;
  border: none;
`;

const Modal: React.FC<ModalProps> = ({ isShowing, hide, children }) =>
  isShowing
    ? ReactDOM.createPortal(
        <>
          <ModalOverlay onClick={hide} />
          <ModalWrapper aria-modal tabIndex={-1} role="dialog">
            <ModalContent>
              <ModalCloseButton type="button" data-dismiss="modal" aria-label="Sulje" onClick={hide}>
                <CloseIcon />
              </ModalCloseButton>
              {children}
              <CloseButton type="button" data-dismiss="modal" aria-label="Sulje" label="Sulje" handleClick={hide} />
            </ModalContent>
          </ModalWrapper>
        </>,
        document.body,
      )
    : null;

export default Modal;
