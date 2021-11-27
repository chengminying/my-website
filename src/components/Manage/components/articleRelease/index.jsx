import React, { useEffect, useState, useRef } from "react";
import "./index.less";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/theme/yonce.css";
import "codemirror/keymap/sublime";
import { saveArticle, getMenus, getArticle, updateArticle } from "../../../../axios/http";
import { Button, Select, Modal, Form, Input, InputNumber, message } from "antd";
import { withRouter } from "react-router-dom";
import { ExclamationCircleOutlined } from '@ant-design/icons';


const Option = Select.Option;

export default withRouter(function ArticleRelease(props) {
  const content = useRef(null);
  const left = useRef(null);
  const right = useRef(null);
  const resize = useRef(null);
  const [codeValue, setCodeValue] = useState("");
  const editorInstance = useRef(null);
  const [iframeValue, setIframeValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [menuList, setMenuList] = useState([]);
  const [formInstance] = Form.useForm();
  const params = useRef(props.location.query);
  const [pointerEvents, setPointerEvents] = useState("auto");

  useEffect(() => {

    getMenusList();

    resize.current.onmousedown = function (e) {
      setPointerEvents("none");
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
        setPointerEvents("auto");
        resize.current.releaseCapture && resize.current.releaseCapture();
      };
      resize.current.setCapture && resize.current.setCapture();
      return false;
    };
    return () => {};
  }, []);

  useEffect(() => {
    _getArticle();
    return () => {
      // cleanup
    };
  }, [params]);

  function _getArticle() {
    if(!params.current) return;
    if (Object.keys(params.current).length === 0) return;
    const { _id } = params.current;
    getArticle({ _id }).then((res) => {
      if (res.data.success) {
        setCodeValue(() => res.data.data.content);
        setIframeValue(() => res.data.data.content);
      } else {
        params.current = undefined;
      }
    });
  }

  function getMenusList() {
    getMenus().then((res) => {
      if (res.data.success) {
        setMenuList(() => res.data.data);
      }
    });
  }

  function handleBeforeChange(editor, data, value) {
    setCodeValue(value);
  }

  function hideModal() {
    setVisible(false);
  }

  function run() {
    const editor = editorInstance.current;
    if (!editor) return;
    const value = editor.getValue();
    setIframeValue(value);
  }

  function showModal() {
    setVisible(true);
  }

  function modify() {
    Modal.confirm({
      title: '确认修改',
      icon: <ExclamationCircleOutlined />,
      content: '确认修改当前文章的内容吗?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        updateArticle({_id: params.current._id, content: codeValue}).then(res => {
          if(res.data.success) {
            message.success(res.data.msg);
            setCodeValue("");
            setIframeValue("");
          } else {
            message.error(res.data.msg);
          }
        })
      },
      onCancel() {
      },
    });
  
  }

  function submit(value) {
    const editor = editorInstance.current;
    const editor_value = editor.getValue();

    const params = {
      title: value.title,
      path: value.path,
      order: value.order,
      content: editor_value,
    };

    saveArticle(params).then((res) => {
      if (res.data.success) {
        message.success(res.data.msg);
        hideModal();
        setCodeValue("");
        setIframeValue("");
      } else {
        message.error(res.data.msg);
      }
    });
  }
  return (
    <div ref={(ref) => (content.current = ref)} className="manage-content">
      <div ref={(ref) => (left.current = ref)} className="manage-content-left">
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
            scrollbarStyle: "overlay",
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"], // 用来添加额外的gutter
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
            pointerEvents,
          }}
          // sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        ></iframe>
      </div>
      <Modal
        title="提交文章"
        visible={visible}
        onCancel={hideModal}
        footer={null}
      >
        <Form layout="inline" onFinish={submit} form={formInstance}>
          <Form.Item
            label="文章标题"
            name="title"
            style={{ marginTop: "1rem", width: "53.3%" }}
            hasFeedback
            rules={[{ required: true, message: "请输入文章标题" }]}
          >
            <Input disabled={params.current && Object.keys(params.current).length ? true : false } placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item
            label="选择目录"
            name="path"
            style={{ marginTop: "1rem", width: "53.3%" }}
            hasFeedback
            rules={[{ required: true, message: "请选择目录" }]}
          >
            <Select placeholder="选择目录" style={{ width: "100%" }} allowClear>
              {menuList.map((v) => (
                <Option key={v.path} value={v.path}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="文章顺序"
            name="order"
            style={{ marginTop: "1rem", width: "53.3%" }}
            hasFeedback
            rules={[{ required: true, message: "请输入文章顺序" }]}
          >
            <InputNumber
              placeholder="请输入文章排列顺序"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item style={{ marginLeft: "43%", marginTop: "1rem" }}>
            <Button type="primary" htmlType="submit">
              {params.current ? "修改" : "提交"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <div className="manage-content-bottom">
        <Button type="primary" onClick={run}>
          运行
        </Button>
        {params.current ? (
          <Button type="primary" onClick={modify}>
            修改
          </Button>
        ) : (
          <Button type="primary" onClick={showModal}>
            提交
          </Button>
        )}
      </div>
    </div>
  );
});
