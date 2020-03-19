import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { KEY } from './common/const';
import Header from './Header';
import Map from './Map';

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
`;

function App() {
  return (
    <AppContainer>
      <GlobalStyles />
      <Header />
      <Main>
        <p>{KEY}: frontend</p>
        <Map />
      </Main>
    </AppContainer>
  );
}

export default App;
