import axios from 'axios';

axios.defaults.withCredentials = true; // 允许携带cookie

axios.withCredentials = true;

// const online = "https://www.chengmy.com.cn/req/";
const online = "http://110.40.213.74:80/req/";
const local = "http://localhost:8088/req/";

// const url = window.location.hostname === "localhost" ? local : online;
const url = online;

const address = {
  getHomeShow: url + "getHomeShow",
  getMenus: url + "getMenus",
  postMenus: url + "postMenus",
  updateMenu: url + "updateMenu",
  saveArticle: url + "saveArticle",
  getArticleIndex: url + "getArticleIndex",
  getArticle: url + "getArticle",
  updateArticle: url + "updateArticle",
  updateArticleImage: url + "updateArticleImage",
  deleteArticle: url + "deleteArticle",

  login: url + "login",
}

const getHomeShow = params => {
  return axios.get(address.getHomeShow, {params});
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

const updateArticleImage = params => {
  return axios.post(address.updateArticleImage, params);
}

const deleteArticle = params => {
  return axios.get(address.deleteArticle, {params});
}

const login = params => {
  return axios.post(address.login, params);
}

export {
  getHomeShow,
  getMenus,
  postMenus,
  updateMenu,

  saveArticle,
  getArticleIndex,
  getArticle,
  updateArticle,
  updateArticleImage,
  deleteArticle,

  login
}