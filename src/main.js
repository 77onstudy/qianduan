// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'font-awesome/css/font-awesome.min.css'
import axios from 'axios'
import qs from 'qs'
import {
  getCurDate,
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage
} from './common.js'

// 创建应用实例
const app = createApp(App)

// 配置 axios
axios.defaults.baseURL = 'http://localhost:8080/'

// 添加全局属性 (Vue 3 方式)
app.config.globalProperties.$axios = axios
app.config.globalProperties.$qs = qs
app.config.globalProperties.$getCurDate = getCurDate
app.config.globalProperties.$setSessionStorage = setSessionStorage
app.config.globalProperties.$getSessionStorage = getSessionStorage
app.config.globalProperties.$removeSessionStorage = removeSessionStorage
app.config.globalProperties.$setLocalStorage = setLocalStorage
app.config.globalProperties.$getLocalStorage = getLocalStorage
app.config.globalProperties.$removeLocalStorage = removeLocalStorage

// 路由守卫
router.beforeEach((to, from, next) => {
  const user = sessionStorage.getItem('user')
  if (!(
    to.path === '/' || 
    to.path === '/index' || 
    to.path === '/businessList' || 
    to.path === '/businessInfo' || 
    to.path === '/login' || 
    to.path === '/register'||
    to.path === '/sellerLogin'||
    to.path === '/sellerRegister'
  )) {
    if (user == null) {
      router.push('/login')
      
    }
  }
  next()
})

// 挂载应用
app.use(router).mount('#app')