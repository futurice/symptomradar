import React from "react";
import "./App.css";
import { KEY } from "./common/const";
import logo from "./logo.svg";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{KEY}: frontend</p>
      </header>
    </div>
  );
}

export default App;
