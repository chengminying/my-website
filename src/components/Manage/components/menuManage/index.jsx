import React, { useEffect, useState } from "react";
import { Table, Space, Modal, Form, Input, Button, InputNumber, message } from "antd";
import { getMenus, postMenus, updateMenu } from "../../../../axios/http";

export default function Menu() {
  const [visible, setVisible] = useState(false);
  const [modify, setModify] = useState(false);
  const [menuList, setMenuList] = useState(null);
  const [currentModify, setCurrentModify] = useState({});
  const [addForm] = Form.useForm();
  const [modifyForm] = Form.useForm();

  const columns = [
    {
      title: "菜单名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "顺序",
      dataIndex: "order",
      key: "order",
    },
    {
      title: "路由",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      render: (text, record) => {
        return (
          <Space size="middle">
            <a href="javascript:void(0);" onClick={() => handleClick(record)}>修改</a>
            <a href="javascript:void(0);" onClick={addMenu}>新增</a>
            {/* <a href="#!;">删除</a> */}
          </Space>
        );
      },
    },
  ];

  function addMenu() {
    setVisible(() => true);
  }

  function handleClick(record) {
    setModify(() => true);
    setCurrentModify(() => record);
    modifyForm.setFieldsValue({
      name: record.name,
      order: record.order,
      path: record.path
    })
  }

  useEffect(() => {
    getMenuList()
    return () => {};
  }, []);

  function hideModal() {
    setVisible(() => false);
    setModify(() => false);
  }

  function getMenuList() {
    getMenus().then((res) => {
      if (!res.data.success) return;
      setMenuList(() => res.data.data.map((v) => ({ ...v, key: v._id })));
    });
  }

  function onFinish (value) {
    const params = {
      name: value.name,
      order: value.order,
      path: value.path,
      parentId: 0,
    };

    postMenus(params).then((res) => {
      if(res.data.success) {
        message.success(res.data.msg);
        hideModal();
        getMenuList();
      } else {
        message.error(res.data.msg);
      }
    });
  }

  function update (value) {
    const params = {
      name: value.name,
      order: value.order,
      path: value.path,
      icon: "",
      _id: currentModify._id
    }

    updateMenu(params).then(res => {
      if(res.data.success) {
        getMenuList();
        message.success(res.data.msg);
        hideModal();
      } else {
        message.error(res.data.msg);
      }
    })
  }

  return (
    <>
      <Table columns={columns} dataSource={menuList} />
      <Modal
        title="添加菜单"
        visible={visible}
        footer={null}
        onCancel={hideModal}
      >
        <Form layout="inline" onFinish={onFinish} form={addForm}>
          <Form.Item
            label="菜单名称"
            name="name"
            style={{ width: "46%" }}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请输入菜单名称",
              },
            ]}
          >
            <Input placeholder="菜单名称" />
          </Form.Item>
          <Form.Item
            label="菜单排序"
            name="order"
            style={{ width: "46%" }}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请调整菜单排序",
              },
            ]}
          >
            <InputNumber type="number" placeholder="输入数字" />
          </Form.Item>
          <Form.Item
            label="路　　由"
            name="path"
            style={{ width: "46%", marginTop: "1rem" }}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请输入路由",
              },
            ]}
          >
            <Input placeholder="输入路由" />
          </Form.Item>
          <Form.Item
            label="菜单图标"
            name="icon"
            style={{ width: "93%", marginTop: "1rem", marginLeft: "0.67rem" }}
            hasFeedback
            rules={[
              {
                required: false,
                message: "请输入菜单图标链接地址",
              },
            ]}
          >
            <Input placeholder="请输入图标的链接地址" />
          </Form.Item>
          <Form.Item style={{marginLeft: '43%', marginTop: '1rem'}}>
            <Button type="primary" htmlType="submit" >提交</Button>
          </Form.Item>
        </Form>
      </Modal>


      <Modal
        title="修改菜单"
        visible={modify}
        footer={null}
        onCancel={hideModal}
      >
        <Form layout="inline" onFinish={update} form={modifyForm}>
          <Form.Item
            label="菜单名称"
            name="name"
            style={{ width: "46%" }}
            hasFeedback
            initialValue={currentModify.name}
            rules={[
              {
                required: true,
                message: "请输入菜单名称",
              },
            ]}
          >
            <Input placeholder="菜单名称" />
          </Form.Item>
          <Form.Item
            label="菜单排序"
            name="order"
            style={{ width: "46%" }}
            hasFeedback
            initialValue={currentModify.order}
            rules={[
              {
                required: true,
                message: "请调整菜单排序",
              },
            ]}
          >
            <InputNumber style={{width: "100%"}} type="number" placeholder="输入数字" />
          </Form.Item>
          <Form.Item
            label="路　　由"
            name="path"
            style={{ width: "46%", marginTop: "1rem" }}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请输入路由",
              },
            ]}
          >
            <Input placeholder="输入路由" />
          </Form.Item>
          <Form.Item
            label="菜单图标"
            name="icon"
            style={{ width: "93%", marginTop: "1rem", marginLeft: "0.67rem" }}
            hasFeedback
            rules={[
              {
                required: false,
                message: "请输入菜单图标链接地址",
              },
            ]}
          >
            <Input placeholder="请输入图标的链接地址" />
          </Form.Item>
          <Form.Item style={{marginLeft: '43%', marginTop: '1rem'}}>
            <Button type="primary" htmlType="submit" >修改</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
