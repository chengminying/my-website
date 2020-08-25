import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import { MenuOutlined, FileTextOutlined } from "@ant-design/icons";
import "./index.less";
import { Link, Switch, Route } from "react-router-dom";
import { MenuManage, ArticleManage } from './components/index';

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

export default function Manage() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  function onCollapse() {
    setCollapsed((collapsed) => !collapsed);
  }

  function onOpenChange(openKey) {
    console.log(openKey);
  }

  function onSelect(arg) {
    console.log(arg);
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
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          onOpenChange={onOpenChange}
          onSelect={onSelect}
        >
          <Menu.Item key="1" icon={<MenuOutlined />}>
            <Link to="/manage/menu">目录管理</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<FileTextOutlined />}>
            <Link to="/manage/article">文章管理</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content>
          <div className="site-layout-background-manage">
            <Switch>
              <Route exact path="/manage/menu" component={MenuManage} />
              <Route exact path="/manage/article" component={ArticleManage} />
            </Switch>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
