import React, { useEffect, useState, useRef } from "react";
import "./index.less";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/theme/yonce.css";
import "codemirror/keymap/sublime";
import { Button } from "antd";

export default function Article() {
  const content = useRef(null);
  const left = useRef(null);
  const right = useRef(null);
  const resize = useRef(null);
  const container = useRef(null);
  const [codeValue, setCodeValue] = useState('');

  useEffect(() => {
    resize.current.onmousedown = function (e) {
      const startX = e.clientX;
      resize.current.left = resize.current.offsetLeft;
      document.onmousemove = function (e) {
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
      document.onmouseup = function (evt) {
        document.onmousemove = null;
        document.onmouseup = null;
        resize.current.releaseCapture && resize.current.releaseCapture();
      };
      resize.current.setCapture && resize.current.setCapture();
      return false;
    };
    return () => {};
  }, []);

  function handleBeforeChange(editor, data, value) {
    // console.log(editor, data, value, "before");
    setCodeValue(value);
  }

  function handleChange(editor, data, value) {
    // console.log(value);
    console.log(editor, data, value);
  }

  function run() {
    const instance = container.current.editor;
    const value = instance.getValue();
    console.log(value);
  }

  function submit() {
    const instance = container.current.editor;
    const value = instance.setValue("");
  }

  return (
    <div ref={(ref) => (content.current = ref)} className="manage-content">
      <div ref={(ref) => (left.current = ref)} className="manage-content-left">
        <CodeMirror
          value={codeValue}
          onBeforeChange={handleBeforeChange}
          onChange={handleChange}
          options={{
            mode: "htmlmixed", //语言模式
            theme: "yonce", //主题
            lineNumbers: true, // 显示行号
            smartIndent: true,// 是否智能缩进
            tabSize: 2,// tab缩进空格数
            autoCloseTags: true, // 自动关闭标签
            autoCloseBrackets: true, // 自动输入括弧
            foldGutter: true, // 允许在行号位置折叠
            // indentUnit: 2,// 缩进单位，默认2
            keyMap: 'sublime', // 快捷键集合
            styleActiveLine: true // 激活当前行样式
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
      ></div>
      <div className="manage-content-bottom">
        <Button type="primary" onClick={run}>
          运行
        </Button>
        <Button type="primary" onClick={submit}>
          提交
        </Button>
      </div>
    </div>
  );
}
