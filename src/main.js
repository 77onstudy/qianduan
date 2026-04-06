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

const app = createApp(App)

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'

axios.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

app.config.globalProperties.$axios = axios
app.config.globalProperties.$qs = qs
app.config.globalProperties.$getCurDate = getCurDate
app.config.globalProperties.$setSessionStorage = setSessionStorage
app.config.globalProperties.$getSessionStorage = getSessionStorage
app.config.globalProperties.$removeSessionStorage = removeSessionStorage
app.config.globalProperties.$setLocalStorage = setLocalStorage
app.config.globalProperties.$getLocalStorage = getLocalStorage
app.config.globalProperties.$removeLocalStorage = removeLocalStorage
app.config.globalProperties.$unwrap = response => response?.data?.data ?? null

router.beforeEach((to, from, next) => {
  const publicPaths = new Set([
    '/',
    '/index',
    '/businessList',
    '/businessInfo',
    '/login',
    '/register',
    '/sellerLogin',
    '/sellerRegister',
    '/adminLogin'
  ])

  if (publicPaths.has(to.path)) {
    next()
    return
  }

  const hasLogin =
    sessionStorage.getItem('user') ||
    sessionStorage.getItem('seller') ||
    sessionStorage.getItem('admin')

  if (!hasLogin) {
    next('/login')
    return
  }

  if (to.meta?.authType === 'seller' && !sessionStorage.getItem('seller')) {
    next('/sellerLogin')
    return
  }

  if (to.meta?.authType === 'admin' && !sessionStorage.getItem('admin')) {
    next('/adminLogin')
    return
  }

  next()
})

app.use(router).mount('#app')
