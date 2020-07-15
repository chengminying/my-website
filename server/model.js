const mongoose = require('mongoose');

//连接mongodb
const DB_URL = "mongodb://localhost:27017/website";
mongoose.connect(DB_URL);
mongoose.connection.on('connected', function() {
    console.log("mongoDB连接成功");
});

const models = {
  obj: {
    
  }
};