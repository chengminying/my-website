import React, { useEffect, useState, useRef } from "react";
import { Layout, Menu, Button } from "antd";
// import {
//   DesktopOutlined,
//   PieChartOutlined,
//   FileOutlined,
//   TeamOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
import "./index.less";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/theme/yonce.css";
import "codemirror/keymap/sublime";
import { getMenus, getArticleIndex, getArticle } from "../../axios/http";

const { Footer, Sider, Content } = Layout;
const { SubMenu } = Menu;

export default function Page() {
  const [collapsed, setCollapsed] = useState(false);
  const [menusList, setMenusList] = useState([]);
  const [articleList, setArticleList] = useState([]);
  const [openKey, setOpenKey] = useState("");
  const [selectKey, setSelectKey] = useState("");

  //codemirror
  const content = useRef(null);
  const left = useRef(null);
  const right = useRef(null);
  const resize = useRef(null);
  const editorInstance = useRef(null);
  const [iframeValue, setIframeValue] = useState("");
  const [codeValue, setCodeValue] = useState("");
  // const [articleConten, setArticleConten] = useState("");

  useEffect(() => {
    Promise.all([getMenus(), getArticleIndex()]).then((res) => {
      //菜单目录
      if (!res[0].data.success) return;
      setMenusList(() => res[0].data.data);
      //文章目录
      if (!res[1].data.success) return;
      setArticleList(() => res[1].data.data);
      //默认展开菜单第一个
      const firstMenu = res[0].data.data[0];
      setOpenKey(firstMenu.path);
      //默认选择菜单第一项第一个
      const firstItem = res[1].data.data.filter(v => v.path === firstMenu.path).sort((a, b) => a.order - b.order);
      setSelectKey(firstItem[0].title)
      //文章
      _getArticle(firstItem[0]._id);
      run();
    });

    //窗口拖动
    resize.current.onmousedown = function (e) {
      const startX = e.clientX;
      resize.current.left = resize.current.offsetLeft;
      content.current.onmousemove = function (e) {
        var endX = e.clientX;
        var moveLen = resize.current.left + (endX - startX);
        var maxT = content.current.clientWidth - resize.current.offsetWidth;
        // if(moveLen<150) moveLen = 120;
        if (moveLen > maxT - 150) moveLen = maxT - 150;

        resize.current.style.left = moveLen;
        left.current.style.width = moveLen + "px";
        right.current.style.width =
          content.current.clientWidth - moveLen - 5 + "px";
      };
      content.current.onmouseup = function (evt) {
        content.current.onmousemove = null;
        content.current.onmouseup = null;
        resize.current.releaseCapture && resize.current.releaseCapture();
      };
      resize.current.setCapture && resize.current.setCapture();
      return false;
    };

    return () => {
      // cleanup
    };
  }, []);

  // function getMenusList() {
  //   getMenus().then((res) => {
  //     if (!res.data.success) return;
  //     setMenusList(() => res.data.data);
  //   });
  // }

  // function _getArticleIndex() {
  //   getArticleIndex().then((res) => {
  //     if (!res.data.success) return;
  //     setArticleList(() => res.data.data);
  //   });
  // }

  function _getArticle(id) {
    getArticle({ _id: id }).then((res) => {
      if(res.data.success) {
        setCodeValue(() => res.data.data.content);
        run();
      }
    });
  }

  function menuClick({keyPath}) {
    if(keyPath.length < 1) return ;
    setSelectKey(keyPath[0]);
    const article = articleList.filter(v => v.path === keyPath[1]).filter(v => v.title === keyPath[0])[0];
    _getArticle(article._id);
  }

  function OpenChange(v) {
    if (v.length) setOpenKey(v[1]);
  }

  function onCollapse() {
    setCollapsed((collapsed) => !collapsed);
  }

  function handleBeforeChange(editor, data, value) {
    setCodeValue(value);
  }

  function run() {
    const editor = editorInstance.current;
    if (!editor) return;
    const value = editor.getValue();
    setIframeValue(value);
  }

  function reset() {}

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
          selectedKeys={[selectKey]}
          mode="inline"
          openKeys={[openKey]}
          onClick={menuClick}
          onOpenChange={OpenChange}
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
              ref={(ref) => (content.current = ref)}
              className="manage-content"
            >
              <div
                ref={(ref) => (left.current = ref)}
                className="manage-content-left"
              >
                <CodeMirror
                  className="codemirror-manage"
                  value={codeValue}
                  onBeforeChange={handleBeforeChange}
                  editorDidMount={(editor) => (editorInstance.current = editor)}
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
                    gutters: [
                      "CodeMirror-linenumbers",
                      "CodeMirror-foldgutter",
                    ], // 用来添加额外的gutter
                  }}
                />
              </div>
              <div
                ref={(ref) => (resize.current = ref)}
                className="manage-content-resize"
              ></div>
              <div
                ref={(ref) => (right.current = ref)}
                className="manage-content-right"
              >
                <iframe
                  title="three"
                  srcDoc={iframeValue}
                  style={{
                    width: "100%",
                    border: "0px",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                  // sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                ></iframe>
              </div>
              <div className="manage-content-bottom">
                <Button type="primary" onClick={run}>
                  运行
                </Button>
                <Button type="primary" onClick={reset}>
                  重置
                </Button>
              </div>
            </div>
          </div>
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
