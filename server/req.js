const express = require("express");

const Router = express.Router();

const model = require("./model");
const menuModel = model.getModel("menu");
const articleIndexModel = model.getModel("articleIndex");
const articleModel = model.getModel("article");
const remoteAddressModel = model.getModel("remoteAddress");


Router.post("/login", function(req, res) {
  const { username, pwd } = req.body;
  const user = "chengmy";
  const p = "cheng76735206";

  const { isMy } = req.cookies;

  if(isMy) return res.json({success: true, msg: "登陆成功"});

  if(username === user && p === pwd && !isMy) {
    res.cookie("isMy", true, {maxAge: 12*30*24*60*60*1000});
    return res.json({success: true, msg: "登陆成功"})
  } else {
    return res.json({success: false, msg: "账号密码错误"})
  }
})

Router.post("/postMenus", function (req, res) {
  const { name, order, parentId, path } = req.body;
  menuModel.findOne({ name, path }, function (err, doc) {
    if (doc) {
      return res.json({ success: false, msg: "菜单名重复" });
    }
    const model = new menuModel({ name, order, parentId, path });
    model.save(function (e, d) {
      if (e) {
        return res.json({ success: false, msg: "后端出错了", err: e });
      }
      const { name, order, parent, path, _id } = d;
      // res.cookie("user_id", _id);
      return res.json({
        success: true,
        msg: "添加成功",
        data: { name, order, parent, path, _id },
      });
    });
  });
});

//
Router.get("/getMenus", function (req, res) {
  menuModel.find({}, function (err, doc) {
    if (!doc) return;
    //数据处理 目录递归
    const new_doc = doc.sort((a, b) => {
      return a.order - b.order;
    });
    return res.json({ success: true, msg: "", data: new_doc });
  });
});

Router.post("/updateMenu", function (req, res) {
  const { name, order, path, _id, icon } = req.body;
  menuModel.update({ _id }, { name, order, path, icon }, function (err, doc) {
    if (!err) {
      return res.json({ success: true, msg: "修改成功", num: doc.nModified });
    }
    return res.json({ success: false, msg: "修改失败" });
  });
});

Router.post("/saveArticle", function (req, res) {
  const { path, order, content, title } = req.body;
  menuModel.findOne({ path }, function (err, doc) {
    if (!doc) return res.json({ success: false, msg: "选择菜单出错" });
    const model = new articleIndexModel({ path, order, title });
    model.save(function (e, d) {
      if (e)
        return res.json({ success: false, msg: "保存文章目录出错了", err: e });
      const _model = new articleModel({ content, _id: d._id, title, path });
      _model.save(function (e, d) {
        if (e)
          return res.json({
            success: false,
            msg: "保存文章内容出错了",
            err: e,
          });
        if (d)
          return res.json({
            success: true,
            msg: "文章保存成功",
            data: { path: d.path, _id: d._id },
          });
      });
    });
  });
});

Router.get("/getArticleIndex", function (req, res) {
  articleIndexModel.find({}, function (err, doc) {
    if (!doc) return;
    return res.json({ success: true, msg: "请求文章成功", data: doc });
  });
});

Router.get("/getHomeShow", function (req, res) {
  const { OSName, OSVersion, exploreName } = req.query;
  const ip = getClientIp(req);
  if(ip !== "::1") {
    const _model = new remoteAddressModel({ ip, create_time: new Date(), OSName, OSVersion, exploreName });
    _model.save(function (e, d) {})
  }
  articleModel.find({ showInHome: true }, function (err, doc) {
    if (!doc) return res.json({ success: false, msg: "获取首页文章失败" });
    return res.json({ success: true, msg: "获取首页文章成功", data: doc });
  });
});


function getClientIp(req) {
  // console.log("headers = " + JSON.stringify(req.headers));// 包含了各种header，包括x-forwarded-for(如果被代理过的话)
  // console.log("x-forwarded-for = " + req.header('x-forwarded-for'));// 各阶段ip的CSV, 最左侧的是原始ip
  // console.log("ips = " + JSON.stringify(req.ips));// 相当于(req.header('x-forwarded-for') || '').split(',')
  // console.log("remoteAddress = " + req.connection.remoteAddress);// 未发生代理时，请求的ip
  // console.log("ip = " + req.ip);// 同req.connection.remoteAddress, 但是格式要好一些
  return req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress || '';
};

Router.get("/getArticle", function (req, res) {
  const { _id } = req.query;
  articleModel.findOne({ _id }, function (err, doc) {
    if (!doc) return res.json({ success: false, msg: "获取文章出错" });
    return res.json({ success: true, msg: "文章获取成功", data: doc });
  });
});

Router.post("/updateArticle", function (req, res) {
  const { _id, title, order, content } = req.body;
  if (content) {
    articleModel.update({ _id }, { content }, function (err, doc) {
      if (!err) {
        return res.json({
          success: true,
          msg: "修改成功",
          num: doc.nModified,
        });
      }
      return res.json({ success: false, msg: "修改文章失败" });
    });
  } else {
    articleIndexModel.update({ _id }, { title, order }, function (err, doc) {
      if (!err) {
        return res.json({
          success: true,
          msg: "修改成功",
          num: doc.nModified,
        });
      }
      return res.json({ success: false, msg: "修改文章目录失败" });
    });
  }
});

Router.post("/updateArticleImage", function (req, res) {
  const { _id, imageURL, showInHome, path } = req.body;
  if (imageURL || showInHome || path) {
    articleModel.update({ _id }, { imageURL, showInHome, path }, function (err, doc) {
      if (!err) {
        return res.json({
          success: true,
          msg: "修改成功",
          num: doc.nModified,
        });
      }
      return res.json({ success: false, msg: "修改文章首页失败" });
    });
  } else {
    return res.json({ success: false, msg: "首页参数为空" });
  }
  
});

Router.get("/deleteArticle", function(req, res) {
  const { _id } = req.query;
  let res1, res2;
  articleIndexModel.findByIdAndDelete(_id, function(err, doc) {
    doc ? res1 = true : res1 = false;
  });
  articleModel.findByIdAndDelete(_id, function(err, doc) {
    doc ? res2 = true : res1 = false;
  });  
  if(res1 && res2) {
    return res.json({ success: true, msg: "删除文章成功" });
  } else {
    return res.json({ success: false, msg: "删除文章失败" });
  }
});

module.exports = Router;
