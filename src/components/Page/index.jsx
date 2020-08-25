import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import "./index.less";

const { Footer, Sider, Content } = Layout;
const { SubMenu } = Menu;


export default function Page() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  function onCollapse() {
    setCollapsed((collapsed) => !collapsed);
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
        <div className="logo">
          <img src="https://chengmy.oss-cn-hangzhou.aliyuncs.com/MyWebsite/loading.gif" alt=""/>
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<PieChartOutlined />}>
              Option 1
            </Menu.Item>
            <Menu.Item key="2" icon={<DesktopOutlined />}>
              Option 2
            </Menu.Item>
            <SubMenu key="sub1" icon={<UserOutlined />} title="User">
              <Menu.Item key="3">Tom</Menu.Item>
              <Menu.Item key="4">Bill</Menu.Item>
              <Menu.Item key="5">Alex</Menu.Item>
            </SubMenu>
            <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
              <Menu.Item key="6">Team 1</Menu.Item>
              <Menu.Item key="8">Team 2</Menu.Item>
            </SubMenu>
            <Menu.Item key="9" icon={<FileOutlined />} />
        </Menu>
      </Sider>
      <Layout>
        <Content>
          <div className="site-layout-background">Bill is a cat.</div>
        </Content>
        <Footer className="footer">
          <span> ©2020 chengmy.com.cn 版权所有 浙ICP备20028636号</span>
          <br />
          <a
            href="http://www.beian.gov.cn/portal/registerSystemInfo?spm=5176.12901015.7y9jhqsfz.28.55a7525cUJFQgr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="//img.alicdn.com/tfs/TB1..50QpXXXXX7XpXXXXXXXXXX-40-40.png"
              alt=""
            />
            <span>浙公网安备 30159517644991568号</span>
          </a>
        </Footer>
      </Layout>
    </Layout>
  );
}
