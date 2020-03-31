import React from 'react';
import { Router, RouteComponentProps } from '@reach/router';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './Header';
import Map from './Map';
import About from './About';
import Privacy from './Privacy';

const GlobalStyles = createGlobalStyle`
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  body {
    font-family: sans-serif;
    line-height: 1.5;
    font-size: 16px;
  }

  h1 {
    font-size: 21px;
    line-height: 1.25;
    font-weight: bold;
    margin: 0 0 24px;
  }

  h2 {
    font-weight: bold;
    font-size: 16px;
    margin: 32px 0 12px 0;
  }

  h3 {
    font-weight: normal;
    font-size: 16px;
    margin-bottom: 8px;
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
        <About path="about" />
        <Privacy path="tietosuojalauseke" />
      </Router>
    </Main>
  </AppContainer>
);
