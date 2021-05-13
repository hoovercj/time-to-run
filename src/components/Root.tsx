import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";

import "./Root.scss";

import App from "./App";
import About from "./About";

function Root() {
  return (
    <Router
      basename={`${process.env.PUBLIC_URL}`}
    >
      <div className="root">
        <h1 className="header"><NavLink exact to="/" className="primary">Time to Run</NavLink></h1>
        <NavLink exact to="/about" className="about-link inverted">About</NavLink>
        <Switch>
          <Route path="/about" component={About} />
          <Route path="/" component={App} />
        </Switch>
      </div>
    </Router>
  );
}

export default Root;