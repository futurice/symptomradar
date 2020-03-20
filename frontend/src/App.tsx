import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './Header';
import Map from './Map';
import Modal from './Modal';
import useModal from './useModal';
import { Form } from './Form';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto');
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  body {
    font-family: 'Roboto', sans-serif;
    background-color: #4A4A4A;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
`;

const Main = styled.main`
  padding: 0 24px;
  text-align: center;
`;

const Button = styled.button`
  background-color: #ffffff;
  position: absolute;
  bottom: 60px;
  width: 212px;
  height: 77px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
`;

const App = () => {
  const { isShowing, toggle } = useModal();
  return (
    <AppContainer>
      <GlobalStyles />
      <Header />
      <Main>
        <Map />
        <Button onClick={toggle}>Report your symptoms</Button>
        <Modal isShowing={isShowing} hide={toggle} modalTitle={'Report your symptoms'}>
          <Form submitted={console.log} />
        </Modal>
      </Main>
    </AppContainer>
  );
};

export default App;
