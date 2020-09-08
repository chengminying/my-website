import axios from 'axios';

axios.defaults.withCredentials = true; // 允许携带cookie

axios.withCredentials = true;

const online = "https://www.chengmy.com.cn/req/";
const local = "http://localhost:8088/req/";

const url = window.location.hostname === "localhost" ? local : online;

const address = {
  getMenus: url + "getMenus",
  postMenus: url + "postMenus",
  updateMenu: url + "updateMenu",

  saveArticle: url + "saveArticle",
  getArticleIndex: url + "getArticleIndex",
  getArticle: url + "getArticle",
  updateArticle: url + "updateArticle",
  deleteArticle: url + "deleteArticle",

  login: url + "login",
}

const getMenus = () => {
  return axios.get(address.getMenus);
}

const postMenus = params => {
  return axios.post(address.postMenus, params);
}

const updateMenu = params => {
  return axios.post(address.updateMenu, params);
}

const saveArticle = params => {
  return axios.post(address.saveArticle, params);
}

const getArticleIndex = params => {
  return axios.get(address.getArticleIndex, params);
}

const getArticle = params => {
  return axios.get(address.getArticle, {params});
}

const updateArticle = params => {
  return axios.post(address.updateArticle, params);
}

const deleteArticle = params => {
  return axios.get(address.deleteArticle, {params});
}

const login = params => {
  return axios.post(address.login, params);
}

export {
  getMenus,
  postMenus,
  updateMenu,

  saveArticle,
  getArticleIndex,
  getArticle,
  updateArticle,
  deleteArticle,

  login
}