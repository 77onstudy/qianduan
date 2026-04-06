<template>
	<div class="order-container">
		<!-- 顶部导航 -->
		<div class="order-header">
			<!-- 添加返回按钮 -->
			<div class="back-button" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<h1>确认订单</h1>
		</div>

		<div class="order-content">
			<!-- 左侧内容 -->
			<div class="order-left">
				<!-- 地址区域 -->
				<div class="address-section">
					<h2>订单配送至</h2>
					<div class="address-card" @click="toUserAddress">
						<div class="address-info">
							<div class="address-text">{{ deliveryaddress?.address || '请选择送货地址' }}</div>
							<div class="contact-info">{{ deliveryaddress?.contactName || user.userName }} {{
								deliveryaddress?.contactTel || '' }}</div>
						</div>
						<i class="fas fa-chevron-right address-icon"></i>
					</div>
				</div>

				<!-- 商家信息 -->
				<div class="business-info">
					<div class="business-icon">
						<img :src="business?.businessImg || placeholder" :alt="business?.businessName || '商家Logo'"
							@error="onImgError">
					</div>
					<div class="business-name">{{ business.businessName || '加载中...' }}</div>
				</div>

				<!-- 商品列表 -->
				<div class="products-section">
					<h3 class="section-title">商品清单</h3>
					<div class="product-list">
						<div class="product-item" v-for="item in filteredCartArr" :key="item.food.foodId">
							<div class="product-left">
								<div class="product-image">
									<img :src="item.food.foodImg || placeholder" :alt="item.food.foodName || '商品图片'"
										@error="onImgError">
								</div>
								<div class="product-details">
									<div class="product-name">{{ item.food.foodName }}</div>
									<div class="product-quantity">x {{ item.quantity }}</div>
								</div>
							</div>
							<!-- 修改价格颜色为黑色 -->
							<div class="product-price" style="color: #333;">¥{{ (item.food.foodPrice *
								item.quantity).toFixed(2) }}</div>
						</div>

						<!-- 空购物车提示 -->
						<div class="empty-cart" v-if="filteredCartArr.length === 0">
							<i class="fas fa-shopping-cart empty-icon"></i>
							<p class="empty-text">购物车为空，无法下单</p>
						</div>
					</div>
				</div>

				<!-- 配送费 -->
				<div class="delivery-fee" v-if="business.deliveryPrice !== undefined">
					<div class="fee-label">配送费</div>
					<div class="fee-value">¥{{ business.deliveryPrice.toFixed(2) }}</div>
				</div>
			</div>

			<!-- 右侧摘要 -->
			<div class="order-right">
				<h3 class="summary-title">订单摘要</h3>

				<div class="summary-item">
					<div class="summary-label">商品金额</div>
					<div class="summary-value">¥{{ (totalPrice - (business.deliveryPrice || 0)).toFixed(2) }}</div>
				</div>

				<div class="summary-item" v-if="business.deliveryPrice !== undefined">
					<div class="summary-label">配送费</div>
					<div class="summary-value">¥{{ business.deliveryPrice.toFixed(2) }}</div>
				</div>

				<div class="summary-total">
					<div class="total-label">实付：</div>
					<div class="total-amount">¥{{ totalPrice.toFixed(2) }}</div>
				</div>

				<button class="pay-button" @click="toPayment">去支付</button>
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
				deliveryaddress: null
			}
		},
		created() {
			this.user = this.$getSessionStorage('user') || {};

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
					} else {
						alert(`获取商家信息失败：${response.data.message}`);
					}
				})
				.catch(() => {
					alert('网络错误，无法获取商家信息');
				});

			// 获取购物车信息
			this.$axios.get(`/api/carts/${this.businessId}`, config)
				.then(response => {
					if (response.data.success) {
						this.cartArr = response.data.data.items || [];
					} else {
						alert(`获取购物车失败：${response.data.message}`);
					}
				})
				.catch(() => {
					alert('网络错误，无法获取购物车信息');
				});
		},
		computed: {
			filteredCartArr() {
				return this.cartArr.filter(item => item && item.food);
			},
			totalPrice() {
				let total = 0;
				this.filteredCartArr.forEach(item => {
					total += item.food.foodPrice * item.quantity;
				});
				total += this.business.deliveryPrice || 0;
				return Math.round(total * 100) / 100;
			},
			placeholder() {
				return (
					'data:image/svg+xml;utf8,' +
					encodeURIComponent(
						`<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70">  <!-- 尺寸匹配商品图片容器 -->
          <rect width="100%" height="100%" fill="#e2e8f0"/>  <!-- 背景色和商品容器一致 -->
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="12">No Image</text>
        </svg>`
					)
				);
			},
		},
		methods: {
			handleAddressFromRoute() {
				const addressStr = this.$route.query.address;
				if (addressStr) {
					try {
						const address = JSON.parse(addressStr);
						if (address.id && address.address && address.contactTel) {
							this.deliveryaddress = address;
							this.$setLocalStorage('selectedDeliveryAddress', address);
						}
					} catch (e) {
						// 解析失败静默处理
					}
				}
			},
			handleAddressFromLocalStorage() {
				const storedAddress = this.$getLocalStorage('selectedDeliveryAddress');
				if (storedAddress && storedAddress.id && storedAddress.address) {
					this.deliveryaddress = storedAddress;
				}
			},
			toUserAddress() {
				this.$router.push({
					path: '/userAddress',
					query: {
						businessId: this.businessId,
						from: 'OrdersPage'
					}
				});
			},
			toPayment() {
				if (!this.user?.userId) {
					alert('请先登录');
					this.$router.push('/login');
					return;
				}
				if (!this.deliveryaddress?.id) {
					alert('请选择送货地址！');
					return;
				}
				if (!this.filteredCartArr.length) {
					alert('购物车为空，无法下单');
					return;
				}
				const token = sessionStorage.getItem('token');
				if (!token) {
					alert('登录已过期，请重新登录');
					this.$router.push('/login');
				}

				const payload = {
					business: {
						id: Number(this.businessId)
					},
					deliveryAddress: {
						id: Number(this.deliveryaddress.id)
					}
				};

				const config = {
					headers: {
						Authorization: `Bearer ${token}`
					}
				};

				this.$axios.post('/api/orders', payload, config)
					.then(res => {
						if (res.data?.success) {
							const created = res.data.data;
							this.$router.push({
								path: '/payment',
								query: {
									orderId: created.id,
									from: 'OrdersPage'
								}
							});
						} else {
							alert(`创建订单失败：${res.data?.message || '未知错误'}`);
						}
					})
					.catch(() => {
						alert('网络错误，创建订单失败');
					});
			},
			onImgError(e) {
				e.target.src = this.placeholder;
			}
		}
	}
</script>

<style scoped>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
	}

	.order-container {
		width: 100%;
		max-width: 1200px;
		min-height: 80vh;
		margin: 40px auto;
		background: white;
		border-radius: 20px;
		box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* 顶部导航 - 添加返回按钮 */
	.order-header {
		background: white;
		padding: 25px 40px;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		align-items: center;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
		position: relative;
	}

	.back-button {
		position: absolute;
		left: 20px;
		top: 50%;
		transform: translateY(-50%);
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #f1f3f2;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.back-button:hover {
		background: #8faca5;
		color: white;
	}

	.back-symbol {
		font-size: 22px;
		font-weight: 600;
	}

	.order-header h1 {
		font-size: 26px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 auto;
	}

	/* 主体内容 */
	.order-content {
		display: flex;
		flex: 1;
	}

	/* 左侧内容 */
	.order-left {
		flex: 7;
		padding: 40px;
		border-right: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
	}

	/* 地址区域 */
	.address-section {
		background: #f8fafc;
		border-radius: 16px;
		padding: 25px;
		margin-bottom: 35px;
		border: 1px solid #e2e8f0;
		transition: all 0.3s ease;
	}

	.address-section:hover {
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
	}

	.address-section h2 {
		font-size: 18px;
		color: #64748b;
		margin-bottom: 15px;
		font-weight: 500;
	}

	.address-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		padding: 15px 0;
	}

	.address-info {
		flex: 1;
	}

	.address-text {
		font-size: 20px;
		font-weight: 500;
		color: #1e293b;
		margin-bottom: 8px;
		line-height: 1.4;
	}

	.contact-info {
		font-size: 16px;
		color: #64748b;
	}

	.address-icon {
		color: #94a3b8;
		font-size: 22px;
	}

	/* 商家信息 */
	.business-info {
		display: flex;
		align-items: center;
		margin-bottom: 35px;
		padding: 20px;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.business-icon {
		width: 50px;
		height: 50px;
		border-radius: 12px;
		background: #8faca5;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		margin-right: 20px;
		font-size: 20px;
		overflow: hidden;
		/* 新增：防止图片超出容器 */
	}

	/* 新增：商家图片适配样式 */
	.business-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* 保持图片比例，填充容器（不拉伸变形） */
		display: block;
	}

	.business-name {
		font-size: 22px;
		font-weight: 600;
		color: #1e293b;
	}

	/* 商品列表 */
	.products-section {
		margin-bottom: 30px;
		flex: 1;
	}

	.section-title {
		font-size: 18px;
		color: #64748b;
		margin-bottom: 20px;
		font-weight: 500;
		padding-bottom: 10px;
		border-bottom: 1px solid #e2e8f0;
	}

	.product-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.product-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		transition: all 0.3s ease;
	}

	.product-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
	}

	.product-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.product-image {
		width: 70px;
		height: 70px;
		border-radius: 10px;
		background: #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #94a3b8;
		font-size: 24px;
		overflow: hidden;
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* 保持图片比例，填充容器 */
		display: block;
	}

	.product-details {
		display: flex;
		flex-direction: column;
	}

	.product-name {
		font-size: 18px;
		font-weight: 500;
		color: #1e293b;
		margin-bottom: 6px;
	}

	.product-quantity {
		font-size: 16px;
		color: #64748b;
	}

	/* 修改价格颜色为黑色 */
	.product-price {
		font-size: 18px;
		font-weight: 600;
		color: #333;
		/* 改为黑色 */
	}

	/* 空购物车 */
	.empty-cart {
		text-align: center;
		padding: 80px 24px;
		color: #94a3b8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.empty-icon {
		font-size: 72px;
		margin-bottom: 20px;
		opacity: 0.5;
	}

	.empty-text {
		font-size: 20px;
	}

	/* 配送费 */
	.delivery-fee {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 0;
		border-top: 1px solid #e2e8f0;
		margin-top: auto;
	}

	.fee-label {
		font-size: 18px;
		color: #64748b;
	}

	.fee-value {
		font-size: 18px;
		font-weight: 500;
		color: #1e293b;
	}

	/* 右侧摘要 */
	.order-right {
		flex: 3;
		padding: 40px;
		background: #f8fafc;
		display: flex;
		flex-direction: column;
	}

	.summary-title {
		font-size: 20px;
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 25px;
		padding-bottom: 15px;
		border-bottom: 1px solid #e2e8f0;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 15px;
	}

	.summary-label {
		font-size: 16px;
		color: #64748b;
	}

	.summary-value {
		font-size: 16px;
		color: #1e293b;
		font-weight: 500;
	}

	.summary-total {
		display: flex;
		justify-content: space-between;
		margin-top: 25px;
		padding-top: 20px;
		border-top: 1px solid #e2e8f0;
		font-size: 20px;
		font-weight: 600;
		color: #1e293b;
	}

	.pay-button {
		width: 100%;
		background: #8faca5;
		color: white;
		border: none;
		border-radius: 12px;
		padding: 20px;
		font-size: 18px;
		font-weight: 600;
		cursor: pointer;
		margin-top: 30px;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(143, 172, 165, 0.3);
	}

	.pay-button:hover {
		background: #7a9c94;
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(143, 172, 165, 0.4);
	}

	/* 响应式设计 */
	@media (max-width: 900px) {
		.order-content {
			flex-direction: column;
		}

		.order-left {
			border-right: none;
			border-bottom: 1px solid #e2e8f0;
		}

		.order-container {
			margin: 20px auto;
			min-height: auto;
		}

		.order-header {
			padding: 15px 40px 15px 60px;
		}

		.back-button {
			left: 15px;
		}
	}
</style>