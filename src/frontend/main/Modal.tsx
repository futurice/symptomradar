import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

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
`;

const ModalContent = styled.div`
  z-index: 100;
  background: white;
  padding: 18px;
  width: 100%;
  bottom: 0;
  max-height: 90vh;
  max-width: 90vw;
  overflow: scroll;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @media (min-width: 768px) {
    max-width: 500px;
  }
`;

const ModalCloseButton = styled.button`
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  cursor: pointer;
  border: none;
  background-color: transparent;
  position: absolute;
  right: 12px;
  z-index: 1;
`;

const Modal: React.FC<ModalProps> = ({ isShowing, hide, children }) =>
  isShowing
    ? ReactDOM.createPortal(
        <>
          <ModalOverlay />
          <ModalWrapper aria-modal aria-hidden tabIndex={-1} role="dialog">
            <ModalContent>
              <ModalCloseButton type="button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                <span aria-hidden="true">&times;</span>
              </ModalCloseButton>
              {children}
            </ModalContent>
          </ModalWrapper>
        </>,
        document.body,
      )
    : null;

export default Modal;
