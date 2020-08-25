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


// import { Table, Switch, Space } from 'antd';

// const columns = [
//   {
//     title: 'Name',
//     dataIndex: 'name',
//     key: 'name',
//   },
//   {
//     title: 'Age',
//     dataIndex: 'age',
//     key: 'age',
//     width: '12%',
//   },
//   {
//     title: 'Address',
//     dataIndex: 'address',
//     width: '30%',
//     key: 'address',
//   },
// ];



// // rowSelection objects indicates the need for row selection
// const rowSelection = {
//   onChange: (selectedRowKeys, selectedRows) => {
//     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
//   },
//   onSelect: (record, selected, selectedRows) => {
//     console.log(record, selected, selectedRows);
//   },
//   onSelectAll: (selected, selectedRows, changeRows) => {
//     console.log(selected, selectedRows, changeRows);
//   },
// };

// function TreeData() {
//   const [checkStrictly, setCheckStrictly] = React.useState(false);
//   return (
//     <>
//       <Space align="center" style={{ marginBottom: 16 }}>
//         CheckStrictly: <Switch checked={checkStrictly} onChange={setCheckStrictly} />
//       </Space>
//       <Table
//         columns={columns}
//         rowSelection={{ ...rowSelection, checkStrictly }}
//         dataSource={data}
//       />
//     </>
//   );
// }

// ReactDOM.render(<TreeData />, mountNode);