const express = require('express');
// const utility = require('utility');//md5依赖

const Router = express.Router();

const model = require('./model');
const menuModel = model.getModel('menu') //user是model文件定义的
// const ChatModel = model.getModel('chat') 

const _filter = {'__v': 0} //定义查询结果过滤字段

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

Router.post('/postMenus', function(req, res) {
  console.log("======")
    // const { user, pwd, type } = req.body;
    console.log(req.body)
    // menuModel.findOne({user}, function(err, doc) {
    //     if(doc) {
    //         return res.json({code: 1, msg: "用户已存在"});
    //     }
    //     const model = new UserModel({user,type,pwd:md5Pwd(pwd)});
    //     model.save(function(e,d){
		// 	if (e) {
		// 		return res.json({code:1,msg:'后端出错了'})
		// 	}
		// 	const {user, type, _id, pwd} = d
		// 	res.cookie('user_id', _id)
		// 	return res.json({code:0,data:{user, type, _id, pwd}})
		// })
    // })
    return res.json({code: 1, data: {name: '11'}});
})

//用户列表查询
Router.get('/getMenus', function(req, res) {
  console.log('-------')
    console.log(req.query)
    return res.json({code: 1, data: {name: '22'}});

    // const { type } = req.query;
    // menuModel.find({}, function(err, doc) {
    //   console.log(doc)
    //   return res.json({code: 0, data: doc});
    // })
})
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