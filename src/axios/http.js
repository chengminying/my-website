import axios from 'axios';

const online = "https://www.chengmy.com.cn/req/";
const local = "http://localhost:8088/req/";

const url = window.location.hostname === "localhost" ? local : online;

const address = {
  getMenus: url + "getMenus",
  postMenus: url + "postMenus",
}

const getMenus = () => {
  return axios.get(address.getMenus);
}

const postMenus = params => {
  return axios.post(address.postMenus, params);
}

export {
  getMenus,
  postMenus
}