import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

type ModalProps = {
  isShowing: boolean;
  hide: () => void;
  modalTitle: string;
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
  border-radius: 14px 14px 0 0;
  padding: 18px;
  width: 100%;
  position: absolute;
  bottom: 0;
  max-height: 90vh;
  overflow: scroll;

  @media (min-width: 768px) {
    max-width: 500px;
    position: relative;
    margin: 1.75rem auto;
    border-radius: 14px;
  }
`;
const ModalHeader = styled.div`
  position: relative;
  display: flex;
  padding: 0px 0 40px 0;
  justify-content: space-between;
`;

const H2 = styled.h2`
  font-size: 21px;
  margin: 8px 0;
`;

const ModalCloseButton = styled.button`
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  cursor: pointer;
  border: none;
  background-color: transparent;
`;

const Modal: React.FC<ModalProps> = ({ isShowing, hide, modalTitle, children }) =>
  isShowing
    ? ReactDOM.createPortal(
        <>
          <ModalOverlay />
          <ModalWrapper aria-modal aria-hidden tabIndex={-1} role="dialog">
            <ModalContent>
              <ModalHeader>
                <H2>{modalTitle}</H2>
                <ModalCloseButton type="button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                  <span aria-hidden="true">&times;</span>
                </ModalCloseButton>
              </ModalHeader>
              {children}
            </ModalContent>
          </ModalWrapper>
        </>,
        document.body,
      )
    : null;

export default Modal;
