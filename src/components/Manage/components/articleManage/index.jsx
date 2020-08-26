import React, { useEffect, useState } from "react";
import CodeMirror from "react-codemirror";
import "./index.less";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-min-noconflict/mode-javascript";
import "ace-builds/src-min-noconflict/theme-monokai";

export default function Article() {
  return (
    <AceEditor
      placeholder="Placeholder Text"
      mode="javascript"
      theme="monokai"
      name="blah2"
      // onLoad={this.onLoad}
      // onChange={this.onChange}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={``}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
    // <CodeMirror value={`console.log()`}  options={options} />
  );
}
