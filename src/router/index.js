import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Login/userLogin.vue')
  },
  {
    path: '/index',
    name: 'IndexPage',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/businessList',
    name: 'BusinessList',
    component: () => import('../views/BusinessList.vue')
  },
  {
    path: '/businessInfo',
    name: 'BusinessInfo',
    component: () => import('../views/BusinessInfo.vue')
  },
  {
    path: '/login',
    name: 'userLogin',
    component: () => import('../views/Login/userLogin.vue')
  },
  {
    path: '/user',
    name: 'UserPage',
    component: () => import('../views/UserPage.vue')  // 👈 新增用户中心页面
  },
  {
    path: '/sellerLogin',
    name: 'sellerLogin',
    component: () => import('../views/Login/sellerLogin.vue')
  },
  {
    path: '/adminLogin',
    name: 'adminLogin',
    component: () => import('../views/Login/adminLogin.vue')
  },
  {
    path: '/adminPage',
    name: 'adminPage',
    component: () => import('../views/adminPage.vue')
  },
  {
    path: '/orders',
    name: 'OrdersPage',
    component: () => import('../views/Orders.vue')
  },
  {
    path: '/userAddress',
    name: 'UserAddress',
    component: () => import('../views/UserAddress.vue')
  },
  {
    path: '/payment',
    name: 'PaymentPage',
    component: () => import('../views/Payment.vue')
  },
  {
    path: '/orderList',
    name: 'OrderList',
    component: () => import('../views/OrderList.vue')
  },
  {
    path: '/addUserAddress',
    name: 'AddUserAddress',
    component: () => import('../views/AddUserAddress.vue')
  },
  {
    path: '/editUserAddress',
    name: 'EditUserAddress',
    component: () => import('../views/EditUserAddress.vue')
  },
  {
    path: '/register',
    name: 'NavRegister',
    component: () => import('../views/Login/NavRegister.vue')
  },
  {
    path: '/sellerRegister',
    name: 'sellerRegister',
    component: () => import('../views/Login/sellerRegister.vue')
  },
  {
    path: '/sellerPage',
    name: 'sellerPage',
    component: () => import('../views/SellerPage.vue')
  },
  {
    path: '/DiscoverPage',
    name: 'DiscoverPage',
    component: () => import('../views/DiscoverPage.vue')
  },
  {
    path: '/goodsManage',
    name:'goodsManage',
    component:()=>import('../views/goodsManage.vue')
  },
  {
    path: '/addFood',
    component: () => import('@/views/addFood.vue')
  },
  {
    path: '/editFood',
    component: () => import('@/views/editFood.vue')
  },
  {
    path: '/admin/businesses/:id/edit',
    name: 'AdminBusinessEdit',
    component: () => import('../views/AdminBusinessEdit.vue'),
    props: true
  },
  {
    path: '/favouriteBusinesses',
    name: 'FavouriteBusinesses',
    component: () => import('../views/FavouriteBusinesses.vue')
  },
  {
    path: '/wallet',
    name: 'WalletPage',
    component: () => import('@/views/WalletPage.vue')
  },
  {
    path: '/trade-stream',
    name: 'TradeStreamPage',
    component: () => import('@/views/TradeStreamPage.vue')
  }

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router