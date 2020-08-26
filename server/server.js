const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const reqRouter = require("./req");

// console.log(reqRouter)

//express实例
const app = express();

const server = require('http').Server(app);


//使用body-parser处理请求
app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({
//   extends: true
// }));

//使用cookie
app.use(cookieParser());

//端口
const PORT = 8088;

// app.use('/req',function(req,res,next){
//   res.header('Access-Control-Allow-Origin', '*');//的允许所有域名的端口请求（跨域解决）
//   res.header('Access-Control-Allow-Headers', '*');
//   res.header('Access-Control-Allow-Methods', '*');
//   // res.header('Content-Type', 'application/json;charset=utf-8');
//   next();
// });

// app.use("/", express.static(path.resolve("../build")));

app.use('/req', reqRouter);


app.use(function(req, res, next) {
  if(req.url.startsWith('/req/')) { 
    return next();
  }
  return res.sendFile(path.resolve('../build/index.html'));
});

server.listen(PORT, function() {
  const date = new Date();
  const y = date.getFullYear().toString();
  const m = date.getMonth();
  const d = date.getDate();
  const t = date.getHours();
  const mi = date.getMinutes();
  const s = date.getSeconds();
  console.log("node服务启动成功,端口为:", PORT, "时间为:", y + "年" + m + "月" + d + "日" + t + "时" + mi + "分" + s + "秒");
})