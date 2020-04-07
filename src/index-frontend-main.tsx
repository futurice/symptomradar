import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './frontend/main/App';
import { AppPlaceholder } from './frontend/main/AppPlaceholder';

// For the time being, the main site remains behind a feature flag
const app = process.env.REACT_APP_STANDALONE_SITE_ENABLED ? <App /> : <AppPlaceholder />;

ReactDOM.render(<React.StrictMode>{app}</React.StrictMode>, document.getElementById('root'));
