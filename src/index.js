import React from "react";
import ReactDOM from "react-dom";
import "./index.less";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Home, Page, Manage } from "./components/index";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/page" component={Page} />
      <Route path="/manage" component={Manage} />
      <Route path="/" component={Home} />
      {/* <Route path="/*" component={} /> */}
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);