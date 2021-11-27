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
  Checkbox
} from "antd";
import {
  getMenus,
  getArticleIndex,
  updateArticle,
  deleteArticle,
  getArticle,
  updateArticleImage,
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
    getArticle({ _id: record._id, }).then((res) => {
      if (res.data.success) {
        setVisible(() => true);
        formInstance.setFieldsValue({
          title: record.title,
          order: record.order,
          path: record.path,
          showInHome: res.data.data.showInHome,
          imageURL: res.data.data.imageURL,
          _id: record._id,
        });
      }
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
    props.history.push({
      pathname: "/manage/articleRelease",
      query: {
        uuid: "stemInfospm=5176.12901015.7y9jhqsfz.28.55a7525cUJ",
        _id: record._id
      },
    });
  }

  function onFinish(value) {
    const params = {
      _id: value._id,
      title: value.title,
      order: value.order,
      path: value.path,
      showInHome: value.showInHome,
      imageURL: value.imageURL,
    };

    updateArticle(params).then((res) => {
      if (res.data.success) {
        updateArticleImage(params).then((res) => {
          if (res.data.success) {
            hideModal();
            getMenusList();
            message.success(res.data.msg);
          }
        });
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
        return record.operation ? (
          <a href="javascript:void(0);" onClick={() => modifyContent(record)}>
            {text}
          </a>
        ) : (
          text
        );
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: "50%",
      render: (text, record) => {
        return record.operation ? (
          <Space size="middle">
            <a href="javascript:void(0);" onClick={() => handleModify(record)}>
              修改和配置首页
            </a>
            <a href="javascript:void(0);" onClick={() => handleRemove(record)}>
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
            label="path"
            name="path"
            style={{ width: "53%" }}
            hasFeedback
            hidden
            rules={[
              {
                required: true,
                message: "path",
              },
            ]}
          >
            <Input placeholder="path" />
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
          <Form.Item
            label="首页显示"
            style={{ width: "53%" }}
            hasFeedback
            rules={[
              {
                required: false,
                message: "请选择该文章是否在首页显示",
              },
            ]}
            name="showInHome" valuePropName="checked" 
          >
            <Checkbox>开启首页显示</Checkbox>
          </Form.Item>
          <Form.Item
            label="首页图片地址"
            name="imageURL"
            style={{ width: "53%" }}
            hasFeedback
            rules={[
              {
                required: false,
                message: "请输入首先显示图片地址",
              },
            ]}
          >
            <Input
              style={{ width: "100%" }}
              placeholder="输入图片地址"
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
