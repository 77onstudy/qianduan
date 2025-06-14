<template>
	<div class="wrapper">
		<header>
			<p>在线支付</p>
		</header>

		<h3>订单信息：</h3>
		<div class="order-info">
			<p>
				{{orders.business.businessName}}
				<i class="fa fa-caret-down" @click="detailetShow"></i>
			</p>
			<p>&#165;{{orders.orderTotal}}</p>
		</div>

		<ul class="order-detailet" v-show="isShowDetailet">
			<li v-for="item in orders.list" :key="item.food.foodId || index">
				<p>{{item.food.foodName}} x {{item.quantity}}</p>
				<p>&#165;{{item.food.foodPrice*item.quantity}}</p>
			</li>
			<li>
				<p>配送费</p>
				<p>&#165;{{orders.business.deliveryPrice}}</p>
			</li>
		</ul>

		<div class="payment-section">
			<h3>支付方式:</h3>
			<ul class="payment-type">
				<li @click="selectPayment('alipay')">
					<img src="../assets/alipay.png" alt="支付宝">
					<i class="fa fa-check-circle" v-show="paymentType === 'alipay'"></i>
				</li>
				<li @click="selectPayment('wechat')">
					<img src="../assets/wechat.png" alt="微信支付">
					<i class="fa fa-check-circle" v-show="paymentType === 'wechat'"></i>
				</li>
			</ul>
		</div>

		<div class="payment-button">
			<button @click="confirmPayment">确认支付</button>
		</div>

		<NavFooter></NavFooter>
	</div>
</template>

<script>
	import NavFooter from '../components/NavFooter.vue';

	export default {
		name: 'PaymentPage',
		data() {
			return {
				orderId: this.$route.query.orderId,
				orders: {
					business: {}
				},
				isShowDetailet: false,
				paymentType: '' // 新增：当前选中的支付方式
			}
		},
		created() {
			this.$axios.post('OrdersController/getOrdersById', this.$qs.stringify({
				orderId: this.orderId
			})).then(response => {
				this.orders = response.data;
			}).catch(error => {
				console.error(error);
			});
		},
		mounted() {
			history.pushState(null, null, document.URL);
			window.onpopstate = () => {
				this.$router.push({
					path: '/index'
				});
			}
		},
		unmounted() {
			window.onpopstate = null;
		},
		methods: {
			detailetShow() {
				this.isShowDetailet = !this.isShowDetailet;
			},
			// 新增：选择支付方式方法
			selectPayment(type) {
				this.paymentType = type;
			},
			confirmPayment() {
				// 1. 调用支付接口
				this.$axios.post('OrdersController/payOrder', this.$qs.stringify({
					orderId: this.orderId,
				})).then(response => {
					if (response.data === 1) {
						// 2. 支付成功，跳转到订单列表页
						this.$router.push('/orderList');
					} else {
						alert('支付失败，请重试！');
					}
				}).catch(error => {
					console.error(error);
					alert('支付请求出错，请检查网络');
				});
			}
		},
		components: {
			NavFooter
		}
	}
</script>

<style scoped>
	/****************** 总容器 ******************/
	.wrapper {
		width: 100%;
		height: 100%;
	}

	/****************** header部分 ******************/
	.wrapper header {
		width: 100%;
		height: 12vw;
		background-color: #0097FF;
		color: #fff;
		font-size: 4.8vw;

		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	/****************** 订单信息部分 ******************/
	.wrapper h3 {
		margin-top: 12vw;
		box-sizing: border-box;
		padding: 4vw 4vw 0;
		font-size: 4vw;
		font-weight: 300;
		color: #999;
	}

	.wrapper .order-info {
		box-sizing: border-box;
		padding: 4vw;
		font-size: 4vw;
		color: #666;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.wrapper .order-info p:last-child {
		color: orangered;
	}

	/****************** 订单明细部分 ******************/
	.wrapper .order-detailet {
		width: 100%;
	}

	.wrapper .order-detailet li {
		width: 100%;
		box-sizing: border-box;
		padding: 1vw 4vw;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.wrapper .order-detailet li p {
		font-size: 3vw;
		color: #666;
	}

	/****************** 支付方式部分 ******************/
	.wrapper .payment-section {
		margin-top: 2vw;
		padding: 0 4vw;
	}

	.wrapper .payment-section h3 {
		padding: 2vw 0 1vw;
		margin: 0;
		font-size: 3.8vw;
	}

	.wrapper .payment-type {
		width: 100%;
	}

	.wrapper .payment-type li {
		width: 100%;
		box-sizing: border-box;
		padding: 3vw 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
	}

	.wrapper .payment-type li img {
		width: 33vw;
		height: 8.9vw;
	}

	.wrapper .payment-type li .fa-check-circle {
		font-size: 5vw;
		color: #38CA73;
		margin-left: 3vw;
	}

	/****************** 支付按钮部分 ******************/
	.wrapper .payment-button {
		width: 100%;
		box-sizing: border-box;
		padding: 4vw;
	}

	.wrapper .payment-button button {
		width: 100%;
		height: 10vw;
		border: none;
		outline: none;
		border-radius: 4px;
		background-color: #38CA73;
		color: #fff;
	}

	/****************** 底部菜单部分 ******************/
	.wrapper .NavFooter {
		width: 100%;
		height: 14vw;
		border-top: solid 1px #DDD;
		background-color: #fff;
		position: fixed;
		left: 0;
		bottom: 0;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.wrapper .NavFooter li {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: #999;
		user-select: none;
		cursor: pointer;
	}

	.wrapper .NavFooter li p {
		font-size: 2.8vw;
	}

	.wrapper .NavFooter li i {
		font-size: 5vw;
	}
</style>