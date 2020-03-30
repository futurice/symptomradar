import React from 'react';
import { Router, RouteComponentProps } from '@reach/router';
import styled, { createGlobalStyle } from 'styled-components';
import Header from './Header';
import Map from './Map';

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

const Main = styled.main`
  padding: 0 24px;
  text-align: center;
`;

const Home = (props: RouteComponentProps) => {
  return <p>Home</p>;
};

const MapView = (props: RouteComponentProps) => {
  return <Map />;
};

export const App = () => (
  <AppContainer>
    <GlobalStyles />
    <Header />
    <Main>
      <Router>
        <Home path="/" />
        <MapView path="/map" />
      </Router>
    </Main>
  </AppContainer>
);
