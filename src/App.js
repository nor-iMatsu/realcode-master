import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';
import './App.css';

import Home from './Home';
// import Login from './Login';
import Register from './Register';

const Base = () => (
  <CookiesProvider>
    <Router>
      <div>
        <Route path="/" component={Home} />
        <Route path="/register" component={Register} />
      </div>
    </Router>
  </CookiesProvider>
);

export default Base
