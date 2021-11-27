import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { MenuOutlined, FileTextOutlined } from "@ant-design/icons";
import "./index.less";
import { Link, Switch, Route, Redirect } from "react-router-dom";
import { MenuManage, ArticleManage, ArticleRelease } from "./components/index";

const { Sider, Content } = Layout;

export default function WrapperManage(props) {
  const query = props.location.query;
  if (!query || props.location.query.uuid !== "stemInfospm=5176.12901015.7y9jhqsfz.28.55a7525cUJ") {
    props.history.goBack();
  }
  return (
    <>
      {
        query && props.location.query.uuid === "stemInfospm=5176.12901015.7y9jhqsfz.28.55a7525cUJ" ? (<Manage />) : null
      }
    </>
  );
}

function Manage() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  function onCollapse() {
    setCollapsed((collapsed) => !collapsed);
  }

  let selectKey;
  const pathname = window.location.pathname;
  if (pathname.indexOf("/manage/articleRelease") !== -1) {
    selectKey = 1;
  } else if (pathname.indexOf("/manage/articleManage") !== -1) {
    selectKey = 2;
  } else if (pathname.indexOf("/manage/menu") !== -1) {
    selectKey = 3;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
        <div className="logo">
          <img
            src="https://chengmy.oss-cn-hangzhou.aliyuncs.com/MyWebsite/loading.gif"
            alt=""
          />
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={`[${selectKey}]`}>
          <Menu.Item key="1" icon={<FileTextOutlined />}>
            <Link
              to={{
                pathname: "/manage/articleRelease",
                query: {
                  uuid: "stemInfospm=5176.12901015.7y9jhqsfz.28.55a7525cUJ",
                },
              }}
            >
              文章发布
            </Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<FileTextOutlined />}>
            <Link
              to={{
                pathname: "/manage/articleManage",
                query: {
                  uuid: "stemInfospm=5176.12901015.7y9jhqsfz.28.55a7525cUJ",
                },
              }}
            >
              文章管理
            </Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<MenuOutlined />}>
            <Link
              to={{
                pathname: "/manage/menu",
                query: {
                  uuid: "stemInfospm=5176.12901015.7y9jhqsfz.28.55a7525cUJ",
                },
              }}
            >
              目录管理
            </Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content>
          <div className="site-layout-background-manage">
            <Switch>
              <Route exact path="/manage/menu" component={MenuManage} />
              <Route
                exact
                path="/manage/articleManage"
                component={ArticleManage}
              />
              <Route
                exact
                path="/manage/articleRelease"
                component={ArticleRelease}
              />
              <Redirect
                exact
                from="/manage"
                to={{
                  pathname: "/manage/articleRelease",
                  query: {
                    uuid: "stemInfospm=5176.12901015.7y9jhqsfz.28.55a7525cUJ",
                  },
                }}
              />
            </Switch>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
