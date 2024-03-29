const mongoose = require('mongoose');

//连接mongodb
const DB_URL = "mongodb://localhost:27017/website";
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
  },
  remoteAddress: {
    id: {type: String, require: true},
    ip: {type: String, require: true},
    create_time: {type: String, default: new Date()},
    OSName: {type: String },
    OSVersion: {type: String },
    exploreName: {type: String },
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