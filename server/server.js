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

app.use(bodyParser.urlencoded({
  extends: true
}));

//使用cookie
app.use(cookieParser());

//端口
const PORT = 8088;



// app.use("/", express.static(path.resolve("build")));


// app.use("/", function(req, res, next) {
//   console.log(req.url, '++++')
//   next();
// })
app.use('/req', reqRouter);


app.use(function(req, res, next) {
  console.log('88888888888')
  console.log(req.url);
  if(req.url.startsWith('/req/')) { 
    return next();
  }
  return res.sendFile(path.resolve('build/index.html'));
})



server.listen(PORT, function() {
  console.log("node服务启动成功,端口为:", PORT);
})