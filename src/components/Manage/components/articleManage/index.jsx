import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
} from "antd";
import {
  getMenus,
  getArticleIndex,
  updateArticle,
  deleteArticle,
} from "../../../../axios/http";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
const { confirm } = Modal;

export default withRouter(function ArticleManage(props) {
  const [tableData, setTableData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [formInstance] = Form.useForm();

  useEffect(() => {
    getMenusList();

    return () => {
      // cleanup
    };
  }, []);

  function getMenusList() {
    Promise.all([getMenus(), getArticleIndex()]).then((res) => {
      const menus = res[0].data.data;
      const articleIndex = res[1].data.data;
      menus.map((v) => {
        v.key = v._id;
        v.children = [];
        for (let i = 0; i < articleIndex.length; i++) {
          if (v.path === articleIndex[i].path) {
            articleIndex[i].key = articleIndex[i]._id;
            articleIndex[i].name = articleIndex[i].title;
            articleIndex[i].operation = true;
            v.children.push(articleIndex[i]);
          }
        }
        v.children.sort((a, b) => a.order - b.order);
        return v;
      });

      setTableData(() => menus);
    });
  }

  function hideModal() {
    setVisible(() => false);
  }

  function handleModify(record) {
    setVisible(() => true);
    formInstance.setFieldsValue({
      title: record.title,
      order: record.order,
      _id: record._id,
    });
  }

  function handleRemove(record) {
    confirm({
      title: "删除文章",
      icon: <ExclamationCircleOutlined />,
      content: "请确认删除这篇文章",
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        deleteArticle({ _id: record._id }).then((res) => {
          getMenusList();
        });
      },
      onCancel() {},
    });
  }

  function modifyContent(record) {
    props.history.push({pathname: "articleRelease", query: {_id: record._id}});
  }

  function onFinish(value) {
    const params = {
      _id: value._id,
      title: value.title,
      order: value.order,
    };

    updateArticle(params).then((res) => {
      if (res.data.success) {
        hideModal();
        getMenusList();
        message.success(res.data.msg);
      }
    });
  }

  const columns = [
    {
      title: "菜单名称",
      dataIndex: "name",
      key: "name",
      width: "50%",
      render: (text, record) => {
        return record.operation ? <a href="#!;" onClick={() => modifyContent(record)}>{text}</a> : text;
      }
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: "50%",
      render: (text, record) => {
        return record.operation ? (
          <Space size="middle">
            <a href="#!" onClick={() => handleModify(record)}>修改</a>
            <a href="#!" onClick={() => handleRemove(record)}>
              删除
            </a>
          </Space>
        ) : null;
      },
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={tableData} />
      <Modal
        title="修改文章"
        visible={visible}
        footer={null}
        onCancel={hideModal}
      >
        <Form layout="horizontal" onFinish={onFinish} form={formInstance}>
          <Form.Item
            label="_id"
            name="_id"
            style={{ width: "53%" }}
            hasFeedback
            hidden
            rules={[
              {
                required: true,
                message: "ID",
              },
            ]}
          >
            <Input placeholder="ID" />
          </Form.Item>
          <Form.Item
            label="文章标题"
            name="title"
            style={{ width: "53%" }}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请输入文章标题",
              },
            ]}
          >
            <Input placeholder="文章标题" />
          </Form.Item>
          <Form.Item
            label="文章序列"
            name="order"
            style={{ width: "53%" }}
            hasFeedback
            rules={[
              {
                required: true,
                message: "请调整文章排序",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              type="number"
              placeholder="输入数字"
            />
          </Form.Item>
          <Form.Item style={{ marginLeft: "43%", marginTop: "1rem" }}>
            <Button type="primary" htmlType="submit">
              修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});
