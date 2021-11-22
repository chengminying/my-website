const mongoose = require('mongoose');

//连接mongodb
const DB_URL = "mongodb://chengmy:cheng76735206@119.45.23.113:27017/website";
mongoose.connect(DB_URL);
mongoose.connection.on('connected', function() {
    console.log("mongoDB连接成功");
});

//model
const models = {
  menu: {
    'name': {type: String, require: true},//用户名
    "order": {type: Number, require: true},
    "path": {type: String, require: true},
    "parentId": {type: Number, require: true},
    "icon": {type: String}
  },
  articleIndex: {
    path: {type: String, require: true},
    order: {type: Number, require: true},
    title: {type: String, require: true},
    create_time: {type: Number, default: new Date().getTime()},
  },
  article: {
    id: {type: String, require: true},
    path: {type: String, require: true},
    title: {type: String, require: true},
    content: {type: String, require: true},
    imageURL: {type: String, default: ""},
    showInHome: {type: Boolean, default: false},
  }
}

for (let i in models) {
  mongoose.model(i, new mongoose.Schema(models[i]))
}

module.exports = {
  getModel: function(name) {
      return mongoose.model(name);
  }
}