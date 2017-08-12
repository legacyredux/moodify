import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import Router from './components/Router.jsx';

ReactDOM.render((
  <BrowserRouter>
    <Router />
  </BrowserRouter>
  ), document.getElementById('root'));
