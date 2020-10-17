import React, { Component } from "react";
import { Layout, Menu, Form, Space, Input, Button } from "antd";
import {
  PlayCircleOutlined,
  RedoOutlined,
  LoginOutlined,
  ShrinkOutlined,
} from "@ant-design/icons";
import "./index.less";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/theme/yonce.css";
import "codemirror/keymap/sublime";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import { getMenus, getArticleIndex, getArticle, login } from "../../axios/http";
import Modal from "antd/lib/modal/Modal";
import { withRouter } from "react-router-dom";

const { Footer, Sider, Content } = Layout;
const { SubMenu } = Menu;

export default withRouter(
  class Page extends Component {
    constructor(props) {
      super(props);
      this.flagKey = 0;
      this.content = null;
      this.left = null;
      this.right = null;
      this.resize = null;
      this.editorInstance = null;
      this.state = {
        collapsed: false,
        menusList: [],
        articleList: [],
        openKey: "",
        selectKey: "",
        initCode: "",
        modalVisible: false,
        pointerEvents: "auto",
        iframeValue: "",
        codeValue: "",
      };
    }

    componentDidMount() {
      console.log(this.props);
      Promise.all([getMenus(), getArticleIndex()]).then((res) => {
        //菜单目录
        if (!res[0].data.success || !res[1].data.success) return;

        //默认展开菜单第一个
        const firstMenu = res[0].data.data;
        //默认选择菜单第一项第一个
        const firstItem = res[1].data.data
          .filter((v) => v.path === firstMenu[0].path)
          .sort((a, b) => a.order - b.order);
        console.log(firstMenu);
        console.log(firstItem);
        this.setState({
          menusList: firstMenu,
          articleList: res[1].data.data,
          openKey: firstMenu[0].path,
          selectKey: firstItem[0].title,
        });
        //文章
        this._getArticle(firstItem[0]._id);
        this.run();
      });

      this.resize.onmousedown = (e) => {
        this.setState({
          pointerEvents: "none"
        });
        const startX = e.clientX;
        this.resize.left = this.resize.offsetLeft;
        this.content.onmousemove = (e) => {
          var endX = e.clientX;
          var moveLen = this.resize.left + (endX - startX);
          var maxT = this.content.clientWidth - this.resize.offsetWidth;
          // if(moveLen<150) moveLen = 120;
          if (moveLen > maxT - 150) moveLen = maxT - 150;

          this.resize.style.left = moveLen;
          this.left.style.width = moveLen + "px";
          this.right.style.width =
            this.content.clientWidth - moveLen - 5 + "px";
        };
        this.content.onmouseup = (evt) => {
          this.content.onmousemove = null;
          this.content.onmouseup = null;
          this.setState({
            pointerEvents: "auto"
          })
          this.resize.releaseCapture && this.resize.releaseCapture();
        };
        this.resize.setCapture && this.resize.setCapture();
        return false;
      };
    }

    _getArticle = (id) => {
      getArticle({ _id: id }).then((res) => {
        if (res.data.success) {
          this.setState({
            codeValue: res.data.data.content,
            initCode: res.data.data.content
          });
          this.run();
        }
      });
    };

    menuClick = ({ keyPath }) => {
      if (keyPath.length < 1) return;
      this.setState({
        selectKey: keyPath[0]
      });
      const article = this.state.articleList
        .filter((v) => v.path === keyPath[1])
        .filter((v) => v.title === keyPath[0])[0];
      this._getArticle(article._id);
    };

    OpenChange = (v, a, n) => {
      if (v.length) {
        this.setState({
          openKey: v[0].key
        })
      }
    };

    onCollapse = () => {
      const { collapsed, openKey } = this.state;
      if (!collapsed) {
        this.setState({
          openKey: 0
        });
        this.flagKey.current = openKey;
      } else {
        this.setOpenKey(this.flagKey);
        this.flagKey = 0;
      }
      this.setState({
        collapsed: !this.state.collapsed
      });
    };

    handleBeforeChange = (editor, data, value) => {
      this.setState({
        codeValue: value
      })
    };

    run = () => {
      const editor = this.editorInstance;
      if (!editor) return;
      const value = editor.getValue();
      this.setState({
        iframeValue: value,
      })
    };

    reset = () => {
      this.setState({
        codeValue: this.state.initCode,
        iframeValue: this.state.initCode
      })
    };

    hideModal = () => {
      this.setState({
        modalVisible: false
      });
    };

    showModal = () => {
      login().then((res) => {
        if (res.data.success) {
          this.hideModal();
          this.props.history.push("manage");
        }
      });
      this.setState({
        modalVisible: true
      });
    };

    onFinish = (value) => {
      login(value).then((res) => {
        if (res.data.success) {
          this.hideModal();
          this.props.history.push("manage");
        } else {
          this.hideModal();
        }
      });
    };

    render() {
      const {
        collapsed,
        selectKey,
        openKey,
        menusList,
        articleList,
        codeValue,
        iframeValue,
        pointerEvents,
        modalVisible,
      } = this.state;
      return (
        <Layout style={{ minHeight: "100vh" }}>
          <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
            <div className="logo">
              <img
                src="https://chengmy.oss-cn-hangzhou.aliyuncs.com/MyWebsite/loading.gif"
                alt=""
              />
            </div>
            <Menu
              theme="dark"
              selectedKeys={[selectKey]}
              mode="inline"
              openKeys={[openKey]}
              onClick={this.menuClick}
              onOpenChange={this.OpenChange}
            >
              {menusList.map((v) => {
                const list = articleList
                  .filter((l) => l.path === v.path)
                  .sort((a, b) => a.order - b.order);
                return (
                  <SubMenu key={v.path} title={v.name}>
                    {list.map((a) => {
                      return <Menu.Item key={a.title}>{a.title}</Menu.Item>;
                    })}
                  </SubMenu>
                );
              })}
            </Menu>
          </Sider>
          <Layout>
            <Content>
              <div className="site-layout-background">
                <div
                  ref={(ref) => (this.content = ref)}
                  className="page-content"
                >
                  <div
                    ref={(ref) => (this.left = ref)}
                    className="page-content-left"
                  >
                    <CodeMirror
                      className="codemirror-manage"
                      value={codeValue}
                      onBeforeChange={this.handleBeforeChange}
                      editorDidMount={(editor) =>
                        (this.editorInstance = editor)
                      }
                      options={{
                        mode: "htmlmixed", //语言模式
                        theme: "yonce", //主题
                        lineNumbers: true, // 显示行号
                        smartIndent: true, // 是否智能缩进
                        tabSize: 2, // tab缩进空格数
                        autoCloseTags: true, // 自动关闭标签
                        autoCloseBrackets: true, // 自动输入括弧
                        foldGutter: true, // 允许在行号位置折叠
                        // indentUnit: 2,// 缩进单位，默认2
                        keyMap: "sublime", // 快捷键集合
                        styleActiveLine: true, // 激活当前行样式
                        scrollbarStyle: "overlay",
                        gutters: [
                          "CodeMirror-linenumbers",
                          "CodeMirror-foldgutter",
                        ], // 用来添加额外的gutter
                      }}
                    />
                  </div>
                  <div
                    ref={(ref) => (this.resize = ref)}
                    className="page-content-resize"
                  ></div>
                  <div
                    ref={(ref) => (this.right = ref)}
                    className="page-content-right"
                  >
                    <iframe
                      title="three"
                      srcDoc={iframeValue}
                      style={{
                        width: "100%",
                        border: "0px",
                        height: "100%",
                        pointerEvents,
                      }}
                      // sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    ></iframe>
                  </div>
                  <div className="page-content-bottom">
                    <Space size={100}>
                      <a href="javascript:void(0);" onClick={this.run}>
                        <PlayCircleOutlined />
                        <span>运行</span>
                      </a>
                      <a href="javascript:void(0);" onClick={this.reset}>
                        <RedoOutlined />
                        <span>重置</span>
                      </a>
                      <a href="javascript:void(0);" onClick={this.showModal}>
                        <LoginOutlined />
                        <span>登陆</span>
                      </a>
                    </Space>
                  </div>
                </div>
              </div>
            </Content>
            <Modal
              visible={modalVisible}
              footer={null}
              onCancel={this.hideModal}
              title="登陆"
            >
              <Form layout="horizontal" onFinish={this.onFinish}>
                <Form.Item
                  label="用户"
                  name="username"
                  // style={{ marginTop: "1rem", width: "53.3%" }}
                  hasFeedback
                  rules={[{ required: true, message: "请输入用户名" }]}
                >
                  <Input placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="pwd"
                  // style={{ marginTop: "1rem", width: "53.3%" }}
                  hasFeedback
                  rules={[{ required: true, message: "请输入密码" }]}
                >
                  <Input type="password" placeholder="请输入密码" />
                </Form.Item>
                <Form.Item style={{ marginLeft: "43%", marginTop: "1rem" }}>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
            <Footer className="footer">
              <span> ©2020 chengmy.com.cn 浙ICP备20028636号</span>
              &nbsp;
              <a
                href="http://www.beian.gov.cn/portal/registerSystemInfo?spm=5176.12901015.7y9jhqsfz.28.55a7525cUJFQgr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="//img.alicdn.com/tfs/TB1..50QpXXXXX7XpXXXXXXXXXX-40-40.png"
                  alt=""
                />
                <span> 浙公网安备 30159517644991568号</span>
              </a>
            </Footer>
          </Layout>
        </Layout>
      );
    }
  }
);
