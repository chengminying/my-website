const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const model = require("./model");

const reqRouter = require("./req");

//express实例
const app = express();

//使用body-parser处理请求
app.use(bodyParser.json());

//使用cookie
app.use(cookieParser());

//端口
const PORT = 8088;

const server = require('http').Server(app);

server.listen(PORT, function() {
  console.log("node服务启动成功,端口为:", PORT);
})