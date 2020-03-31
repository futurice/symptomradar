import React from 'react';
import { Router, RouteComponentProps } from '@reach/router';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './Header';
import Map from './Map';
import About from './About';

const GlobalStyles = createGlobalStyle`
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  body {
    font-family: sans-serif;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
`;

const Main = styled.main``;

export const App = () => (
  <AppContainer>
    <GlobalStyles />
    <Header />
    <Main>
      <Router>
        <Map path="/" />
        <About path="/about" />
      </Router>
    </Main>
  </AppContainer>
);
