const express = require("express");
// const utility = require('utility');//md5依赖

const Router = express.Router();

const model = require("./model");
const menuModel = model.getModel("menu");
const articleIndexModel = model.getModel("articleIndex");
const articleModel = model.getModel("article");

const _filter = { __v: 0 }; //定义查询结果过滤字段

// Router.post("/updataUserInfo", function(req, res) {
//     const user_id = req.cookies.user_id;
//     if(!user_id) {
//         return
//     }
//     const body = req.body;
//     UserModel.findByIdAndUpdate(user_id, body, function(err, doc) {
//         const data = Object.assign({}, {
//             user: doc.user,
//             type: doc.type,
//             pwd: doc.pwd,
//         }, body)
//         return res.json({code: 0, data})
//     })
// })

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
      const _model = new articleModel({ content, _id: d._id, title });
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
// //用户注册，查询用户是否存在，再创建

// //用户登录，查询用户名和密码
// Router.post('/login', function(req, res) {
//     const { user, pwd } = req.body;
//     UserModel.findOne({user, pwd: md5Pwd(pwd)}, _filter, function(err, doc) {
//         if(!doc) {
//             return res.json({code: 1, msg: "用户名或密码错误"})
//         }
//         res.cookie('user_id', doc._id); //设置cookie
//         return res.json({code: 0, data: doc})
//     })
// })
// //登录校验
// Router.get("/info", function(req, res) {
//     const { user_id } = req.cookies; //读取cookie中user_id
//     if(!user_id) return res.json({code: 1})
//     UserModel.findOne({_id: user_id}, _filter, function(err, doc) {
//         if(err) return res.json({code: 1, msg: '后端出错'})
//         return res.json({code: 0, data:doc});
//     })
// })
// //用户信息完善

// //聊天信息列表获取
// Router.get('/getChatList', function(req, res) {
//     const { user_id } = req.cookies;
//     UserModel.find({}, function(err, doc) {
//         let users = {};
//         doc.forEach( v => {
//             users[v._id] = {name: v.user, avatar: v.avatar}
//         })
//         ChatModel.find({'$or': [{from: user_id}, {to: user_id}]}, function(err, doc) {
//             if(!err) {
//                 return res.json({code: 0, data: doc, users: users})
//             }
//         })
//     })
// })
// //
// Router.post('/readingMsg', function(req, res) {
//     const user_id = req.cookies.user_id;
//     const { from } = req.body;
//     ChatModel.update(
//         {from, to: user_id},
//         {'$set': {is_read: true}},
//         {'multi': true},
//         function(err, doc) {
//         if(!err) {
//             return res.json({code: 0, num: doc.nModified})
//         }
//         return res.json({code: 1, msg: '修改失败'})
//     })
// })

//密码加salt工具
// function md5Pwd(pwd) {
//     const salt = "stone_of_dream";
//     return utility.md5(utility.md5(salt+pwd));
// }

module.exports = Router;
