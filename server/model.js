const mongoose = require('mongoose');

//连接mongodb
const DB_URL = "mongodb://119.45.23.113:27017/website";
mongoose.connect(DB_URL);
mongoose.connection.on('connected', function() {
    console.log("mongoDB连接成功");
});

//model
const models = {
  menu: {
    "id": {type: Number },
    'name': {type: String, require: true},//用户名
    "order": {type: Number, require: true},
    "path": {type: String, require: true},
    "parentId": {type: String, require: true},
    "icon": {type: String}
  },
  // chat: {
  //     'chat_id': {type: String, require: true},//聊天信息id
  //     'from': {type: String, require: true},//发送者
  //     'to': {type: String, require: true},//接收者
  //     'msg': {type: String, require: true},//发送内容
  //     'create_time': {type: Number, default: new Date().getTime()},//时间戳
  //     'is_read': {type: String, default: false},//消息是否已读
  // }
}

for (let i in models) {
  mongoose.model(i, new mongoose.Schema(models[i]))
}

module.exports = {
  getModel: function(name) {
      return mongoose.model(name);
  }
}