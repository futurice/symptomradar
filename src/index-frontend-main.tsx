import React from 'react';
import ReactDOM from 'react-dom';
import './frontend/main/index.css';
import { App } from './frontend/main/App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

console.log('branch = test-deploy-dev');
