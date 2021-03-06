const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const history = require("connect-history-api-fallback");

//express实例
const app = express();

const server = require('http').Server(app);

app.use(history());

//使用body-parser处理请求
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extends: true
}));

//使用cookie
app.use(cookieParser());

// app.use(cors());

app.use(cors({credentials: true, origin: true}));

//端口
const PORT = 8088;
const reqRouter = require("./req");
app.use('/req', reqRouter);

// app.use('/req', (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By",' 3.2.1')
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });

var mapPath
if(global.process.platform === "linux") {
  mapPath = "build";
} else {
  mapPath = "../build";
}

app.use(function(req, res, next) {
  if(req.url.startsWith('/static') || req.url.startsWith('/')) { 
    next();
  }
// app.use(express.static(path.resolve(mapPath), { maxAge: 3600 * 60 * 60 * 24}));

});
app.use(express.static(path.resolve(mapPath), { maxAge: 3600 * 60 * 60 * 24}));


server.listen(PORT, function() {
  const date = new Date();
  const y = date.getFullYear().toString();
  const m = date.getMonth();
  const d = date.getDate();
  const t = date.getHours();
  const mi = date.getMinutes();
  const s = date.getSeconds();
  console.log("node服务启动成功,端口为:", PORT, "时间为:", y + "年" + m + 1 + "月" + d + "日" + t + "时" + mi + "分" + s + "秒");
})