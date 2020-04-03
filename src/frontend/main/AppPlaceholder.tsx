import React from 'react';
import { Router, RouteComponentProps } from '@reach/router';
import logo from './assets/oiretutka-logo-gradient.svg';
import './index.css';
import './App.css';

const Home = (props: RouteComponentProps) => (
  <>
    <header>
      <img src={logo} className="logo" alt="Oiretutka. Helsingin Sanomat ja Futurice." />
      <em className="notice">Sivusto päivittyy pian</em>
    </header>
    <main>
      <p>
        Lue projektista lisää{' '}
        <a href="https://www.hs.fi/kotimaa/art-2000006452379.html" target="_blank" rel="noopener noreferrer">
          Helsingin Sanomien artikkelista
        </a>
        .
      </p>
    </main>
  </>
);

export const AppPlaceholder = () => (
  <Router>
    <Home path="/" />
  </Router>
);
