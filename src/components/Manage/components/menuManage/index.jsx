import React, { useEffect, useState } from "react";
import { Table, Space } from "antd";
import { getMenus, postMenus } from "../../../../axios/http";


export default function Menu () {

  const columns = [
    {
      title: "菜单名称",
      dataIndex: "menuName",
      key: "menuName"
    },
    {
      title: "顺序",
      dataIndex: "order",
      key: "order"
    },
    {
      title: "路由",
      dataIndex: "path",
      key: "path"
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (text, record) => {
        return <Space size="middle">
          <a onClick={click}>修改</a>
          <a>新增</a>
          <a>删除</a>
        </Space>
      }
    }
  ];

  function click() {
    const params = {
      name: "测试",
      order: 1,
      path: "manage",
      parent: 0,
    }

    getMenus().then(res => {
      console.log(res);
    })

    postMenus(params).then(res => {
      console.log(res);
    })
  }

  useEffect(() => {





    return () => {

    }
  }, [])

  const data = [
    {
      key: 1,
      menuName: 'John Brown sr.',
      order: 60,
      path: 'New York No. 1 Lake Park',
      children: [
        {
          key: 11,
          name: 'John Brown',
          age: 42,
          address: 'New York No. 2 Lake Park',
        },
        {
          key: 12,
          name: 'John Brown jr.',
          age: 30,
          address: 'New York No. 3 Lake Park',
          children: [
            {
              key: 121,
              name: 'Jimmy Brown',
              age: 16,
              address: 'New York No. 3 Lake Park',
            },
          ],
        },
        {
          key: 13,
          name: 'Jim Green sr.',
          age: 72,
          address: 'London No. 1 Lake Park',
          children: [
            {
              key: 131,
              name: 'Jim Green',
              age: 42,
              address: 'London No. 2 Lake Park',
              children: [
                {
                  key: 1311,
                  name: 'Jim Green jr.',
                  age: 25,
                  address: 'London No. 3 Lake Park',
                },
                {
                  key: 1312,
                  name: 'Jimmy Green sr.',
                  age: 18,
                  address: 'London No. 4 Lake Park',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 2,
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ];

  return (<Table onClick={click} columns={columns} dataSource={data} />)
}