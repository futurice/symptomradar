import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

type ModalProps = {
  isShowing: boolean;
  hide: any;
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
  border-radius: 3px;
  padding: 2rem;
  width: 100%;
  position: fixed;
  bottom: 0;

  @media (min-width: 768px) {
    max-width: 500px;
    position: relative;
    margin: 1.75rem auto;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ModalCloseButton = styled.button`
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  opacity: 0.3;
  cursor: pointer;
  border: none;
`;

const Modal = ({ isShowing, hide }: ModalProps) =>
  isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <ModalOverlay />
          <ModalWrapper aria-modal aria-hidden tabIndex={-1} role="dialog">
            <ModalContent>
              <ModalHeader>
                <ModalCloseButton type="button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                  <span aria-hidden="true">&times;</span>
                </ModalCloseButton>
              </ModalHeader>
              <p>Hello, I'm a modal.</p>
            </ModalContent>
          </ModalWrapper>
        </React.Fragment>,
        document.body,
      )
    : null;

export default Modal;
