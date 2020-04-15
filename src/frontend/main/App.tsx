import React, { useState, useEffect } from 'react';
import { Router, Location } from '@reach/router';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import Header from './Header';
import MapView from './MapView';
import About from './About';
import Survey from './Survey';
import Privacy from './Privacy';

import RobotoEot from './assets/fonts/roboto-v20-latin-ext_latin-regular.eot';
import RobotoSvg from './assets/fonts/roboto-v20-latin-ext_latin-regular.svg';
import RobotoTtf from './assets/fonts/roboto-v20-latin-ext_latin-regular.ttf';
import RobotoWoff from './assets/fonts/roboto-v20-latin-ext_latin-regular.woff';
import RobotoWoff2 from './assets/fonts/roboto-v20-latin-ext_latin-regular.woff2';
import Roboto700Eot from './assets/fonts/roboto-v20-latin-ext_latin-700.eot';
import Roboto700Svg from './assets/fonts/roboto-v20-latin-ext_latin-700.svg';
import Roboto700Ttf from './assets/fonts/roboto-v20-latin-ext_latin-700.ttf';
import Roboto700Woff from './assets/fonts/roboto-v20-latin-ext_latin-700.woff';
import Roboto700Woff2 from './assets/fonts/roboto-v20-latin-ext_latin-700.woff2';

const GlobalStyles = createGlobalStyle`

  /* roboto-regular - latin-ext_latin */
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    src: url(${RobotoEot}); /* IE9 Compat Modes */
    src: local('Roboto'), local('Roboto-Regular'),
        url(${RobotoEot}) format('embedded-opentype'), /* IE6-IE8 */
        url(${RobotoWoff2}) format('woff2'), /* Super Modern Browsers */
        url(${RobotoWoff}) format('woff'), /* Modern Browsers */
        url(${RobotoTtf}) format('truetype'), /* Safari, Android, iOS */
        url(${RobotoSvg}) format('svg'); /* Legacy iOS */
  }
  /* roboto-700 - latin-ext_latin */
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    src: url(${Roboto700Eot}); /* IE9 Compat Modes */
    src: local('Roboto Bold'), local('Roboto-Bold'),
        url(${Roboto700Eot}) format('embedded-opentype'), /* IE6-IE8 */
        url(${Roboto700Woff2}) format('woff2'), /* Super Modern Browsers */
        url(${Roboto700Woff}) format('woff'), /* Modern Browsers */
        url(${Roboto700Ttf}) format('truetype'), /* Safari, Android, iOS */
        url(${Roboto700Svg}) format('svg'); /* Legacy iOS */
  }

  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  
  body {
    font-family: 'Roboto', Arial, sans-serif;
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

export const App = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios('https://data.oiretutka.fi/city_level_general_results.json');
      setData(result.data);
    };
    fetchData();
  }, []);

  return (
    <AppContainer>
      <GlobalStyles />
      <Location>
        {({ location }) => {
          return <Header location={location.pathname} />;
        }}
      </Location>
      <main>
        <Router>
          <MapView path="/" responseData={data} />
          <MapView path="/map-embed" responseData={data} />
          <About path="about" />
          <Privacy path="tietosuojalauseke" />
          <Survey path="survey" />
        </Router>
      </main>
    </AppContainer>
  );
};
