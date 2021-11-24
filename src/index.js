import React from "react";
import ReactDOM from "react-dom";
import "./index.less";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Home, Page, WrapperManage } from "./components/index";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/page" component={Page} />
      <Route path="/manage" component={WrapperManage} />
      <Route path="/" component={Home} />
      {/* <Route path="/*" component={} /> */}
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);