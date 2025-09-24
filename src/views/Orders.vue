<template>
	<div class="wrapper">
		<!-- 顶部导航 -->
		<header>
			<p>确认订单</p>
		</header>

		<!-- 地址区域：增加卡片质感 -->
		<div class="order-info">
			<h5>订单配送至：</h5>
			<div class="order-info-address" @click="toUserAddress">
				<p class="address-text">{{ deliveryaddress?.address || '请选择送货地址' }}</p>
				<i class="fa fa-angle-right address-icon"></i>
			</div>
			<p class="contact-info">{{ user.userName }} {{ deliveryaddress?.contactTel || '' }}</p>
			<!-- 调试信息：弱化样式，不干扰主视觉 -->
			<div class="debug-info">
				调试：地址ID={{ deliveryaddress?.id || '未设置' }} | 来源={{ addressSource || '未获取' }}
			</div>
		</div>

		<!-- 商家名称：增加底部间距，强化层级 -->
		<h3 class="business-name">{{ business.businessName || '加载中...' }}</h3>

		<!-- 商品列表：优化项间距和图片显示 -->
		<div class="order-detailed">
			<li class="product-item" v-for="item in filteredCartArr" :key="item.food.foodId">
				<div class="product-left">
					<img 
						v-if="item.food.foodImg" 
						:src="item.food.foodImg" 
						:alt="item.food.foodName"
						class="food-img"
						loading="lazy"
					>
					<p class="product-name">{{ item.food.foodName }} x {{ item.quantity }}</p>
				</div>
				<p class="product-price">&#165;{{ (item.food.foodPrice * item.quantity).toFixed(2) }}</p>
			</li>
			<!-- 空购物车提示：优化排版和颜色 -->
			<div class="empty-cart" v-if="filteredCartArr.length === 0">
				<i class="fa fa-shopping-cart empty-icon"></i>
				<p class="empty-text">购物车为空，无法下单</p>
			</div>
		</div>

		<!-- 配送费：统一与商品项的视觉风格 -->
		<div class="order-deliveryfee" v-if="business.deliveryPrice !== undefined">
			<p class="fee-label">配送费</p>
			<p class="fee-value">&#165;{{ business.deliveryPrice.toFixed(2) }}</p>
		</div>

		<!-- 底部合计：增加阴影和交互反馈 -->
		<div class="total">
			<div class="total-left">
				<span class="total-label">实付：</span>
				<span class="total-amount">&#165;{{ totalPrice.toFixed(2) }}</span>
			</div>
			<div class="total-right" @click="toPayment">
				去支付
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'OrdersPage',
		data() {
			return {
				businessId: this.$route.query.businessId,
				business: {},
				user: {},
				cartArr: [],
				deliveryaddress: null,
				addressSource: '未获取' 
			}
		},
		created() {
			console.log('===== 订单页创建 =====');
			this.user = this.$getSessionStorage('user') || {};
			console.log('用户信息:', this.user);
			console.log('路由参数:', this.$route.query);

			this.handleAddressFromRoute();
			if (!this.deliveryaddress) {
				this.handleAddressFromLocalStorage();
			}

			if (!this.user.userId) {
				alert('请先登录！');
				this.$router.push('/login');
				return;
			}
			const token = sessionStorage.getItem('token');
			if (!token) {
				alert('请先登录！');
				this.$router.push('/login');
				return;
			}
			const config = {
				headers: {
					'Authorization': `Bearer ${token}` 
				}
			};

			// 获取商家信息
			this.$axios.get(`/api/businesses/${this.businessId}`, config)
			.then(response => {
				if (response.data.success) {
					this.business = response.data.data;
					console.log('商家信息:', this.business);
				} else {
					console.error('获取商家失败:', response.data.message);
					alert(`获取商家信息失败：${response.data.message}`);
				}
			})
			.catch(error => {
				console.error('商家请求错误:', error);
				alert('网络错误，无法获取商家信息');
			});

			// 获取购物车信息
			this.$axios.get(`/api/carts/${this.businessId}`, config)
			.then(response => {
				if (response.data.success) {
					this.cartArr = response.data.data.items || [];
					console.log('购物车数据:', this.cartArr);
				} else {
					console.error('获取购物车失败:', response.data.message);
					alert(`获取购物车失败：${response.data.message}`);
				}
			})
			.catch(error => {
				console.error('购物车请求错误:', error);
				alert('网络错误，无法获取购物车信息');
			});
		},
		computed: {
			filteredCartArr() {
				const result = this.cartArr.filter(item => item && item.food);
				console.log('过滤后购物车:', result.length, '项');
				return result;
			},
			totalPrice() {
				let total = 0;
				this.filteredCartArr.forEach(item => {
					total += item.food.foodPrice * item.quantity;
				});
				total += this.business.deliveryPrice || 0;
				return Math.round(total * 100) / 100;
			}
		},
		methods: {
			handleAddressFromRoute() {
				const addressStr = this.$route.query.address;
				if (addressStr) {
					try {
						const address = JSON.parse(addressStr);
						console.log('从路由参数解析地址:', address);
						if (address.id && address.address && address.contactTel) {
							this.deliveryaddress = address;
							this.addressSource = '路由参数';
							this.$setLocalStorage('selectedDeliveryAddress', address);
							console.log('已同步路由地址到LocalStorage');
						} else {
							console.error('路由地址参数缺失关键字段', address);
						}
					} catch (e) {
						console.error('解析路由地址失败:', e.message);
					}
				} else {
					console.log('路由参数中无address字段');
				}
			},
			handleAddressFromLocalStorage() {
				const storedAddress = this.$getLocalStorage('selectedDeliveryAddress');
				console.log('从LocalStorage读取地址:', storedAddress);
				if (storedAddress && storedAddress.id && storedAddress.address) {
					this.deliveryaddress = storedAddress;
					this.addressSource = 'LocalStorage';
					console.log('LocalStorage地址生效');
				} else {
					console.log('LocalStorage无有效地址');
					this.deliveryaddress = null;
					this.addressSource = '无数据';
				}
			},
			sexFilter(value) {
				return value == 1 ? '先生' : '女士';
			},
			toUserAddress() {
				console.log('跳转地址页，携带businessId:', this.businessId);
				this.$router.push({
					path: '/userAddress',
					query: {
						businessId: this.businessId,
						from: 'OrdersPage'
					}
				});
			},
			toPayment() {
				// 基础校验
				if(!this.user?.userId){
					alert('请先登录');
					this.$router.push('/login');
					return;
				}
				if(!this.deliveryaddress?.id){
					alert('请选择送货地址！');
					return;
				}
				if(!this.filteredCartArr.length){
					alert('购物车为空，无法下单');
					return;
				}
				const token = sessionStorage.getItem('token');
				if(!token){
					alert('登录已过期，请重新登录');
					this.$router.push('/login');
				}
				
				// 组装后端需要的订单负载：只传关联ID，其他让后端算
				const payload = {
					business: { id: Number(this.businessId) },
					deliveryAddress: { id: Number(this.deliveryaddress.id) }
					// 不要传 orderTotal / list，后端会根据购物车自动生成
				};

				const config = { headers: { Authorization: `Bearer ${token}` } };

				// 创建订单
				this.$axios.post('/api/orders', payload, config)
					.then(res => {
					if (res.data?.success) {
						const created = res.data.data;   // 后端返回的订单对象
						// 4) 跳转支付页，带上订单ID
						this.$router.push({
						path: '/payment',
						query: { orderId: created.id, from: 'OrdersPage' }
						});
					} else {
						alert(`创建订单失败：${res.data?.message || '未知错误'}`);
					}
					})
					.catch(err => {
					console.error('创建订单异常：', err);
					alert('网络错误，创建订单失败');
				});
			}
		}
	}
</script>

<style scoped>
	/* 基础样式：统一字体和盒模型 */
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	}

	body {
		background-color: #fafafa;
	}

	/****************** 总容器 ******************/
	.wrapper {
		width: 100%;
		min-height: 100vh;
		padding-bottom: 14vw; /* 给底部合计栏留空间 */
	}

	/****************** 顶部导航 ******************/
	.wrapper header {
		width: 100%;
		height: 12vw;
		background-color: #0097FF;
		color: #fff;
		font-size: 5vw;
		font-weight: 500;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 2px 8px rgba(0, 151, 255, 0.2); /* 增加顶部阴影，提升层次感 */
	}

	/****************** 地址区域 ******************/
	.wrapper .order-info {
		width: 100%;
		margin-top: 12vw;
		background-color: #0097EF;
		padding: 3vw;
		color: #fff;
		border-radius: 0 0 12px 12px; /* 底部圆角，区分导航栏 */
		box-shadow: 0 4px 12px rgba(0, 151, 239, 0.15); /* 增加阴影，模拟悬浮感 */
	}

	.wrapper .order-info h5 {
		font-size: 3.2vw;
		font-weight: 400;
		margin-bottom: 2vw;
		opacity: 0.9;
	}

	/* 地址卡片 */
	.wrapper .order-info .order-info-address {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 500;
		user-select: none;
		cursor: pointer;
		padding: 2vw 0;
		transition: background-color 0.2s;
		border-radius: 8px;
		padding: 2vw;
	}

	/* 地址卡片 hover 反馈 */
	.wrapper .order-info .order-info-address:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.wrapper .order-info .order-info-address .address-text {
		width: 85%;
		font-size: 4.8vw;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}

	.wrapper .order-info .order-info-address .address-icon {
		font-size: 5vw;
		opacity: 0.8;
	}

	/* 联系人信息 */
	.wrapper .order-info .contact-info {
		font-size: 3.2vw;
		margin-top: 1vw;
		opacity: 0.9;
	}

	/* 调试信息：弱化处理 */
	.wrapper .order-info .debug-info {
		font-size: 1.8vw;
		color: #e0f7ff; /* 浅蓝白色，不干扰主视觉 */
		margin-top: 1.5vw;
		opacity: 0.7;
	}

	/****************** 商家名称 ******************/
	.wrapper .business-name {
		padding: 3.5vw;
		font-size: 4.2vw;
		color: #333; /* 加深颜色，提升可读性 */
		border-bottom: 1px solid #eee; /* 柔和边框 */
		background-color: #fff;
		margin-bottom: 2vw;
	}

	/****************** 商品列表 ******************/
	.wrapper .order-detailed {
		width: 100%;
		background-color: #fff;
		border-radius: 12px;
		margin: 0 2vw;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		overflow: hidden;
	}

	/* 商品项 */
	.wrapper .order-detailed .product-item {
		width: 100%;
		height: 20vw; /* 增加高度，提升呼吸感 */
		padding: 3vw;
		color: #333;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #f5f5f5;
		list-style: none;
		transition: background-color 0.2s;
	}

	/* 商品项 hover 反馈 */
	.wrapper .order-detailed .product-item:hover {
		background-color: #fafafa;
	}

	.wrapper .order-detailed .product-item .product-left {
		display: flex;
		align-items: center;
	}

	/* 商品图片：固定比例，避免拉伸 */
	.wrapper .order-detailed .product-item .food-img {
		width: 14vw;
		height: 14vw;
		border-radius: 8px;
		object-fit: cover; /* 保持图片比例 */
		border: 1px solid #f0f0f0;
	}

	.wrapper .order-detailed .product-item .product-name {
		font-size: 3.5vw;
		margin-left: 3vw;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #444;
		max-width: 50vw; /* 限制宽度，避免挤压价格 */
	}

	.wrapper .order-detailed .product-item .product-price {
		font-size: 3.8vw;
		font-weight: 500;
		color: #ff4444; /* 价格红色，突出重点 */
	}

	/* 空购物车提示 */
	.wrapper .order-detailed .empty-cart {
		text-align: center;
		padding: 12vw 5vw;
		color: #999;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.wrapper .order-detailed .empty-cart .empty-icon {
		font-size: 12vw;
		margin-bottom: 4vw;
		opacity: 0.5;
	}

	.wrapper .order-detailed .empty-cart .empty-text {
		font-size: 3.5vw;
	}

	/****************** 配送费 ******************/
	.wrapper .order-deliveryfee {
		width: 100%;
		height: 18vw;
		padding: 3vw 4vw;
		color: #666;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 3.5vw;
		background-color: #fff;
		margin: 2vw;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.wrapper .order-deliveryfee .fee-label {
		color: #666;
	}

	.wrapper .order-deliveryfee .fee-value {
		color: #333;
		font-weight: 500;
	}

	/****************** 底部合计 ******************/
	.wrapper .total {
		width: 100%;
		height: 14vw;
		position: fixed;
		left: 0;
		bottom: 0;
		display: flex;
		box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08); /* 顶部阴影，区分内容区 */
	}

	.wrapper .total .total-left {
		flex: 2;
		background-color: #505051;
		color: #fff;
		font-size: 4.5vw;
		font-weight: 500;
		user-select: none;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.wrapper .total .total-left .total-label {
		opacity: 0.8;
		margin-right: 1.5vw;
	}

	.wrapper .total .total-left .total-amount {
		font-weight: 700;
		font-size: 5vw;
	}

	/* 支付按钮：强化交互 */
	.wrapper .total .total-right {
		flex: 1;
		background-color: #38CA73;
		color: #fff;
		font-size: 4.5vw;
		font-weight: 500;
		user-select: none;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.2s; /* 过渡动画 */
	}

	/* 支付按钮 hover 反馈 */
	.wrapper .total .total-right:hover {
		background-color: #2EAF63; /* 加深绿色 */
		transform: scale(1.02); /* 轻微放大 */
	}

	/* 支付按钮 active 反馈 */
	.wrapper .total .total-right:active {
		transform: scale(0.98); /* 点击收缩 */
	}
</style>