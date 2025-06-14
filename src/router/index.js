import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import BusinessList from '../views/BusinessList.vue'
import BusinessInfo from '../views/BusinessInfo.vue'
import Login from '../views/Login.vue'
import Orders from '../views/Orders.vue'
import UserAddress from '../views/UserAddress.vue'
import Payment from '../views/Payment.vue'
import OrderList from '../views/OrderList.vue'
import AddUserAddress from '../views/AddUserAddress.vue'
import EditUserAddress from '../views/EditUserAddress.vue'
import NavRegister from '../views/NavRegister.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Index
	},
	{
		path: '/index',
		name: 'IndexPage',
		component: Index
	},
	{
		path: '/businessList',
		name: 'BusinessList',
		component: BusinessList
	},
	{
		path: '/businessInfo',
		name: 'BusinessInfo',
		component: BusinessInfo
	},
	{
		path: '/login',
		name: 'LoginPage',
		component: Login
	},
	{
		path: '/orders',
		name: 'OrdersPage',
		component: Orders
	},
	{
		path: '/userAddress',
		name: 'UserAddress',
		component: UserAddress
	},
	{
		path: '/payment',
		name: 'PaymentPage',
		component: Payment
	},
	{
		path: '/orderList',
		name: 'OrderList',
		component: OrderList
	},
	{
		path: '/addUserAddress',
		name: 'AddUserAddress',
		component: AddUserAddress
	},
	{
		path: '/editUserAddress',
		name: 'EditUserAddress',
		component: EditUserAddress
	},
	{
		path: '/register',
		name: 'NavRegister',
		component: NavRegister
	}
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL), // 替代 mode: 'history'
	routes
  })

export default router