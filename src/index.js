import React from 'react';
import ReactDOM from 'react-dom';
import { Global } from '@emotion/core';
import { App } from './reactApp';
import * as serviceWorker from './serviceWorker';
import { styles } from './reactApp/styles';

ReactDOM.render(
  <>
    <Global styles={styles.global} />
    <App />
  </>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
