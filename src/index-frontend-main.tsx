import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './frontend/main/App';

console.log(`Frontend ${process.env.REACT_APP_APP_VERSION} started`);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
