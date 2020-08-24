import React from "react";
import ReactDOM from "react-dom";
import "./index.less";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Home, Page, Manage } from "./components/index";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path="/page" component={Page} />
        <Route path="/manage" component={Manage} />
        <Route path="/" component={Home} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
