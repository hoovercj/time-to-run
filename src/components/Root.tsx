import React from "react";
import {
  BrowserRouter as Router,
  Routes,
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
        <h1 className="header"><NavLink end to="/" className="primary">Time to Run</NavLink></h1>
        <NavLink end to="/about" className="about-link inverted">About</NavLink>
        <Routes>
          <Route path="/about" element={<About/>} />
          <Route path="/" element={<App/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default Root;