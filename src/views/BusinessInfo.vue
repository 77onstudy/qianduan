<template>
	<div class="wrapper">
		<!-- 头部：返回按钮 + 标题 + 收藏按钮 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<p class="header-title">商家信息</p>

			<!-- 收藏按钮：通过 isFavourited 实时切换文字颜色 -->
			<div class="favourite-btn" @click="toggleFavourite" title="收藏商家">
				<span class="favourite-text" :class="{ active: isFavourited }">收藏</span>
			</div>
		</header>

		<!-- 商家信息区域 -->
		<div class="business-section">
			<div class="business-logo">
				<img class="logo" v-if="business.businessImg" :src="business.businessImg" :alt="business.businessName"
					loading="lazy">
				<div class="logo-placeholder" v-else>
					<i class="fa fa-store"></i>
				</div>
			</div>
			<div class="business-info">
				<h1 class="business-name">{{ business.businessName }}</h1>
				<div class="business-meta">
					<span class="meta-item">¥{{ formatPrice(business.startPrice) }}起送</span>
					<span class="meta-split">|</span>
					<span class="meta-item">¥{{ formatPrice(business.deliveryPrice) }}配送</span>
				</div>
				<p class="business-desc">{{ business.businessExplain || '暂无商家介绍' }}</p>
			</div>
		</div>

		<div class="divider"></div>

		<!-- 商品列表区域 - 单行展示 -->
		<div class="food-container">
			<div class="food-list">
				<div class="food-card" v-for="(item, index) in foodArr" :key="item.id || index"
					@mouseenter="item.hover = true" @mouseleave="item.hover = false">
					<div class="food-img">
						<img v-if="item.foodImg" :src="item.foodImg" :alt="item.foodName" loading="lazy">
						<div class="img-placeholder" v-else>
							<i class="fa fa-utensils"></i>
						</div>
					</div>

					<div class="food-info">
						<h3 class="food-name">{{ item.foodName }}</h3>
						<p class="food-desc">{{ item.foodExplain || '暂无商品描述' }}</p>
						<div class="food-bottom">
							<span class="food-price">¥{{ formatPrice(item.foodPrice) }}</span>
							<div class="food-control">
								<button class="control-btn minus-btn" @click="minus(index)" v-show="item.quantity > 0">
									<span class="symbol">-</span>
								</button>
								<span class="control-count" v-show="item.quantity > 0">{{ item.quantity }}</span>
								<button class="control-btn plus-btn" @click="add(index)">
									<span class="symbol">+</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="empty-tip" v-if="foodArr.length === 0">
				<div class="empty-content">
					<i class="fa fa-box-open empty-icon"></i>
					<p class="empty-title">该商家暂无商品</p>
					<p class="empty-desc">请稍后再来看看~</p>
				</div>
			</div>
		</div>

		<!-- 底部购物车栏 -->
		<div class="cart-bar">
			<div class="cart-left">
				<div class="cart-icon-box" :class="{ active: totalQuantity > 0 }" @click="openCartDetail">
					<i class="fa fa-shopping-bag cart-icon"></i>
					<div class="cart-badge" v-show="totalQuantity !== 0">{{ totalQuantity }}</div>
				</div>
				<div class="price-info">
					<div class="cart-total">¥{{ formatPrice(totalPrice) }}</div>
					<div class="cart-delivery">另需配送费 ¥{{ formatPrice(business.deliveryPrice) }}</div>
				</div>
			</div>
			<div class="cart-right">
				<div class="checkout-btn disabled" v-show="totalSettle < business.startPrice">
					¥{{ formatPrice(business.startPrice) }}起送
				</div>
				<div class="checkout-btn" @click="toOrder" v-show="totalSettle >= business.startPrice"
					:class="{ active: totalQuantity > 0 }">
					去结算
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'BusinessInfo',
	data() {
		return {
			businessId: null,
			business: {},
			foodArr: [],
			user: {},
			config: {},
			isLoaded: false,
			defaultStep: 1,
			isFavourited: false // 收藏状态（响应式变量，控制按钮样式）
		}
	},
	created() {
		// 获取路由中的商家ID
		this.businessId = this.$route.query.businessId
		console.log('【收藏调试】当前商家ID：', this.businessId)

		// 验证商家ID有效性
		if (!this.businessId || isNaN(Number(this.businessId))) {
			alert('商家ID无效，请重新进入页面')
			this.$router.go(-1)
			return
		}

		// 验证登录状态
		this.user = this.$getSessionStorage('user')
		const token = sessionStorage.getItem('token')
		if (!this.user?.userId || !token) {
			alert('请先登录！')
			this.$router.push('/login')
			return
		}

		// 初始化请求配置
		this.config = { headers: { Authorization: `Bearer ${token}` } }
		this.loadDataSequence()
	},
	computed: {
		// 计算购物车总价
		totalPrice() {
			return Number(
				this.foodArr.reduce((sum, item) => sum + (Number(item.foodPrice) || 0) * (item.quantity || 0), 0).toFixed(2)
			)
		},
		// 计算购物车商品总数
		totalQuantity() {
			return this.foodArr.reduce((sum, item) => sum + (item.quantity || 0), 0)
		},
		// 计算最终结算金额（含配送费）
		totalSettle() {
			return Number((this.totalPrice + Number(this.business.deliveryPrice || 0)).toFixed(2))
		}
	},
	methods: {
		// 格式化价格（去除末尾的.00）
		formatPrice(price) {
			return (Number(price) || 0).toFixed(2).replace(/\.00$/, '')
		},

		// 按顺序加载页面数据
		async loadDataSequence() {
			try {
				await this.loadBusinessInfo()
				await this.loadFoodList()
				await this.listCart()
				await this.loadFavouriteStatus() // 初始化收藏状态
			} catch (error) {
				console.error('【数据加载失败】', error)
			}
		},

		// 加载商家基本信息
		async loadBusinessInfo() {
			try {
				const response = await this.$axios.get(`/api/businesses/${Number(this.businessId)}`, this.config)
				if (response.data.success) {
					this.business = response.data.data
				} else {
					throw new Error(response.data.message || '获取商家信息失败')
				}
			} catch (error) {
				alert(error.message || '网络错误，无法加载商家信息')
			}
		},

		// 加载商家商品列表
		async loadFoodList() {
			try {
				const response = await this.$axios.get('/api/foods', {
					params: { business: Number(this.businessId) },
					...this.config
				})
				this.foodArr = (response.data.data || []).map(item => ({
					...item,
					quantity: 0,
					cartId: null,
					hover: false,
					step: item.step || this.defaultStep
				}))
			} catch (error) {
				alert('网络错误，无法加载商品列表')
			}
		},

		// 加载购物车数据
		listCart() {
			return new Promise((resolve, reject) => {
				this.$axios
					.get(`/api/carts/${Number(this.businessId)}`, this.config)
					.then(response => {
						if (response.data.success) {
							const cartItems = response.data.data.items || []
							this.foodArr.forEach(food => {
								const matchedItem = cartItems.find(
									item => item.food.id === food.id && Number(item.business.id) === Number(this.businessId)
								)
								food.quantity = matchedItem ? matchedItem.quantity : 0
								food.cartId = matchedItem ? matchedItem.id : null
							})
						}
						resolve()
					})
					.catch(error => {
						this.foodArr.forEach(food => { food.quantity = 0; food.cartId = null })
						reject(error)
					})
			})
		},

		// 加载初始收藏状态（从收藏列表中匹配当前商家）
		async loadFavouriteStatus() {
			try {
				const currentBusinessId = Number(this.businessId)
				const response = await this.$axios.get('/api/love', this.config)
				console.log('【收藏调试】收藏列表响应：', response.data)

				if (response.data.success) {
					// 检查当前商家是否在收藏列表中
					const isInFavourites = response.data.data.some(
						business => Number(business.id) === currentBusinessId
					)
					this.isFavourited = isInFavourites
					console.log('【收藏调试】初始收藏状态：', this.isFavourited)
				} else {
					// 后端返回失败（如无收藏记录），视为未收藏
					this.isFavourited = false
				}
			} catch (error) {
				console.error('【收藏调试】加载收藏状态失败：', error)
				this.isFavourited = false
			}
		},

		// 切换收藏状态（核心：乐观更新+失败回滚）
		async toggleFavourite() {
			const originalStatus = this.isFavourited // 保存原始状态用于回滚

			if (this.isFavourited) {
				// 已收藏 → 取消收藏
				try {
					// 1. 立即更新状态（文字颜色先变回白色）
					this.isFavourited = false
					console.log('【收藏调试】取消收藏：临时更新状态为', this.isFavourited)

					// 2. 调用取消收藏接口
					await this.cancelFavourite()

					// 3. 接口成功：保持状态
					alert('取消收藏成功！')
					console.log('【收藏调试】取消收藏成功，最终状态为', this.isFavourited)
				} catch (error) {
					// 接口失败：回滚状态（文字颜色恢复黄色）
					this.isFavourited = originalStatus
					console.error('【收藏调试】取消收藏失败，状态回滚为', this.isFavourited)
					alert(`取消收藏失败：${error.message || '网络异常'}`)
				}
			} else {
				// 未收藏 → 添加收藏
				try {
					// 1. 立即更新状态（文字颜色先变黄色）
					this.isFavourited = true
					console.log('【收藏调试】添加收藏：临时更新状态为', this.isFavourited)

					// 2. 调用添加收藏接口
					await this.addFavourite()

					// 3. 接口成功：保持状态
					alert('收藏成功！')
					console.log('【收藏调试】添加收藏成功，最终状态为', this.isFavourited)
				} catch (error) {
					// 接口失败：回滚状态（文字颜色恢复白色）
					this.isFavourited = originalStatus
					console.error('【收藏调试】添加收藏失败，状态回滚为', this.isFavourited)
					alert(`收藏失败：${error.message || '网络异常'}`)
				}
			}
		},

		// 添加收藏接口调用
		async addFavourite() {
			const currentBusinessId = Number(this.businessId)
			const response = await this.$axios.post(
				`/api/love/${currentBusinessId}`,
				{},
				this.config
			)
			if (!response.data.success) {
				throw new Error(response.data.message || '添加收藏失败')
			}
			return response.data
		},

		// 取消收藏接口调用
		async cancelFavourite() {
			const currentBusinessId = Number(this.businessId)
			const response = await this.$axios.delete(
				`/api/love/${currentBusinessId}`,
				this.config
			)
			if (!response.data.success) {
				throw new Error(response.data.message || '取消收藏失败')
			}
			return response.data
		},

		// 处理购物车加减操作
		handleCartOperation(index, operation) {
			const food = this.foodArr[index]
			const step = food.step || this.defaultStep
			const originalQuantity = food.quantity
			const newQuantity = operation === 'increase' ? originalQuantity + step : originalQuantity - step

			if (newQuantity < 0) return
			food.quantity = newQuantity

			const requestBody = {
				...(food.cartId && { id: food.cartId }),
				food: { id: food.id, business: { id: Number(this.businessId) } },
				business: { id: Number(this.businessId) },
				operation,
				quantity: operation === 'increase' ? step : -step,
				customer: { id: this.user.userId }
			}

			this.$axios
				.post('/api/carts', requestBody, this.config)
				.then(response => {
					if (response.data.success) {
						food.quantity = response.data.data?.quantity ?? food.quantity
						if (!food.cartId && response.data.data?.id) {
							food.cartId = response.data.data.id
						}
					} else {
						food.quantity = originalQuantity
						alert(`操作失败：${response.data.message || '服务器处理失败'}`)
					}
				})
				.catch(() => {
					food.quantity = originalQuantity
					alert('网络错误，操作失败，请重试')
				})
		},

		// 增加商品数量
		add(index) {
			this.handleCartOperation(index, 'increase')
		},

		// 减少商品数量
		minus(index) {
			const food = this.foodArr[index]
			if (food.quantity <= 0) return

			const step = food.step || this.defaultStep
			const newQuantity = food.quantity - step

			if (!food.cartId) return

			// 数量减为0时直接删除购物车项
			if (newQuantity === 0) {
				this.removeCart(index)
				return
			}

			const originalQuantity = food.quantity
			food.quantity = newQuantity

			this.$axios
				.patch(`/api/carts/${food.cartId}?quantity=${newQuantity}`, this.config)
				.then(response => {
					if (response.data.success) {
						food.quantity = response.data.data.quantity
					} else {
						food.quantity = originalQuantity
						alert(`减少失败：${response.data.message}`)
					}
				})
				.catch(() => {
					food.quantity = originalQuantity
					alert('网络错误，减少失败')
				})
		},

		// 从购物车删除商品
		removeCart(index) {
			const food = this.foodArr[index]
			if (!food.cartId) {
				alert('未找到购物车记录，删除失败')
				return
			}

			this.$axios.delete(`/api/carts/${food.cartId}`, this.config)
				.then(response => {
					if (response.data.success) {
						food.quantity = 0
						food.cartId = null
					} else {
						alert(`删除失败：${response.data.message}`)
					}
				})
				.catch(error => {
					console.error('删除购物车错误：', error)
					alert('网络错误，删除请求失败')
				})
		},

		// 前往结算页面
		toOrder() {
			if (this.totalQuantity === 0) {
				alert('请先添加商品到购物车')
				return
			}
			this.$router.push({ path: '/orders', query: { businessId: this.business.id } })
		},

		// 查看购物车详情
		openCartDetail() {
			if (this.totalQuantity === 0) {
				alert('购物车还是空的哦~ 快去添加商品吧！')
			} else {
				alert(`购物车共有 ${this.totalQuantity} 件商品，合计 ¥${this.formatPrice(this.totalPrice)}`)
			}
		}
	}
}
</script>

<style scoped>
/* 全局样式 */
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
	letter-spacing: 0.2px;
}

.wrapper {
	width: 100%;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	padding-bottom: 80px;
	background-color: #f8faf9;
	color: #2d2b28;
}

/* 头部样式 - 重新设计 */
.header {
	width: 100%;
	height: 70px;
	background-color: #ffffff;
	color: #2d2b28;
	font-size: 20px;
	font-weight: 600;
	position: sticky;
	top: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	padding: 0 25px;
	box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
	margin-bottom: 10px;
}

.back-box {
	width: 42px;
	height: 42px;
	border-radius: 50%;
	background-color: #f1f3f2;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
	margin-right: 15px;
}

.back-box:hover {
	background-color: #8faca5;
	color: white;
}

.back-symbol {
	font-size: 22px;
	font-weight: 600;
}

.header-title {
	flex: 1;
	text-align: center;
}

/* 收藏按钮样式 - 核心：文字颜色切换 */
.favourite-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px 16px;
	border-radius: 20px;
	cursor: pointer;
	transition: all 0.3s ease;
	background: linear-gradient(135deg, #8faca5 0%, #a7c5bd 100%);
	box-shadow: 0 4px 12px rgba(143, 172, 165, 0.3);
	margin-left: auto;
}

.favourite-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 16px rgba(143, 172, 165, 0.4);
}

/* 收藏文字默认样式（白色） */
.favourite-text {
	font-size: 14px;
	font-weight: 500;
	color: #ffffff;
	transition: color 0.3s ease; /* 颜色切换过渡，更流畅 */
}

/* 收藏后文字样式（黄色） */
.favourite-text.active {
	color: #ffd700; /* 金色/黄色，视觉上更符合"已收藏"的标识感 */
	font-weight: 600; /* 收藏后文字稍粗，增强区分度 */
}

/* 商家信息区域 - 重新设计 */
.business-section {
	width: 100%;
	max-width: 1000px;
	margin: 20px auto 0;
	background: white;
	border-radius: 16px;
	padding: 30px;
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.business-logo {
	margin-bottom: 20px;
}

.logo {
	width: 150px;
	height: 150px;
	border-radius: 16px;
	object-fit: cover;
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
	border: 3px solid white;
}

.logo-placeholder {
	width: 150px;
	height: 150px;
	border-radius: 16px;
	background: linear-gradient(135deg, #8faca5 0%, #a7c5bd 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 50px;
	box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.business-info {
	text-align: center;
	padding: 0 16px;
	margin-bottom: 8px;
	width: 100%;
}

.business-name {
	font-size: 28px;
	font-weight: 700;
	color: #2d2b28;
	margin-bottom: 12px;
}

.business-meta {
	display: flex;
	justify-content: center;
	gap: 20px;
	margin-bottom: 15px;
	font-size: 16px;
	color: #6b6763;
}

.meta-split {
	color: #dcdad8;
}

.business-desc {
	font-size: 16px;
	color: #6b6763;
	line-height: 1.6;
	max-width: 600px;
	margin: 0 auto;
	padding: 15px 0;
}

.divider {
	width: 100%;
	height: 1px;
	background: linear-gradient(to right, transparent, #e8e6e4, transparent);
	margin: 20px 0;
}

/* 商品列表区域 - 单行展示 */
.food-container {
	width: 100%;
	max-width: 1000px;
	margin: 0 auto;
	padding: 0 25px;
	margin-bottom: 20px;
}

.food-list {
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.food-card {
	width: 100%;
	background: white;
	border-radius: 16px;
	padding: 20px;
	display: flex;
	align-items: center;
	box-shadow: 0 5px 20px rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
	border: 1px solid #f1f3f2;
}

.food-card:hover {
	transform: translateY(-3px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.food-img {
	width: 120px;
	height: 120px;
	border-radius: 12px;
	overflow: hidden;
	flex-shrink: 0;
	margin-right: 25px;
	background-color: #f1f3f2;
	display: flex;
	align-items: center;
	justify-content: center;
}

.food-img img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.5s ease;
}

.food-card:hover .food-img img {
	transform: scale(1.05);
}

.img-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #b8b5b1;
	font-size: 40px;
}

.food-info {
	flex: 1;
}

.food-name {
	font-size: 18px;
	font-weight: 600;
	color: #2d2b28;
	margin-bottom: 8px;
}

.food-desc {
	font-size: 14px;
	color: #6b6763;
	margin-bottom: 15px;
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.food-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.food-price {
	font-size: 20px;
	font-weight: 700;
	color: #8faca5;
}

/* 商品数量加减按钮 - 重新设计 */
.food-control {
	display: flex;
	align-items: center;
	gap: 10px;
}

.control-btn {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;
	background: #f1f3f2;
}

.minus-btn {
	color: #ff6b6b;
}

.minus-btn:hover {
	background: #ff6b6b;
	color: white;
}

.plus-btn {
	color: #8faca5;
}

.plus-btn:hover {
	background: #8faca5;
	color: white;
}

.symbol {
	font-size: 16px;
	font-weight: bold;
}

.control-count {
	font-size: 16px;
	font-weight: 600;
	color: #2d2b28;
	min-width: 20px;
	text-align: center;
}

/* 空状态提示 - 重新设计 */
.empty-tip {
	width: 100%;
	height: 300px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 20px;
}

.empty-content {
	text-align: center;
}

.empty-icon {
	font-size: 70px;
	color: #dcdad8;
	margin-bottom: 20px;
}

.empty-title {
	font-size: 20px;
	color: #6b6763;
	margin-bottom: 10px;
	font-weight: 600;
}

.empty-desc {
	font-size: 16px;
	color: #a09c97;
}

/* 底部购物车栏 - 重新设计 */
.cart-bar {
	width: 100%;
	height: 80px;
	background-color: #ffffff;
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 25px;
	box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
}

.cart-left {
	display: flex;
	align-items: center;
	gap: 15px;
}

.cart-icon-box {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: linear-gradient(135deg, #8faca5 0%, #a7c5bd 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 4px 12px rgba(143, 172, 165, 0.3);
}

.cart-icon-box:hover {
	transform: scale(1.05);
}

.cart-icon {
	font-size: 20px;
	color: white;
}

.cart-badge {
	position: absolute;
	top: -5px;
	right: -5px;
	background: #ff6b6b;
	color: white;
	font-size: 12px;
	font-weight: 600;
	width: 22px;
	height: 22px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.price-info {
	display: flex;
	flex-direction: column;
}

.cart-total {
	font-size: 18px;
	font-weight: 700;
	color: #2d2b28;
}

.cart-delivery {
	font-size: 13px;
	color: #6b6763;
}

.cart-right {
	display: flex;
	align-items: center;
}

.checkout-btn {
	height: 50px;
	padding: 0 28px;
	background: linear-gradient(135deg, #8faca5 0%, #a7c5bd 100%);
	color: #ffffff;
	font-size: 16px;
	font-weight: 600;
	border-radius: 25px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
	border: none;
	box-shadow: 0 4px 12px rgba(143, 172, 165, 0.3);
}

.checkout-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 16px rgba(143, 172, 165, 0.4);
}

.checkout-btn.disabled {
	background: #f1f3f2;
	color: #a09c97;
	cursor: not-allowed;
	box-shadow: none;
}

.checkout-btn.disabled:hover {
	transform: none;
	box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.header {
		padding: 0 15px;
		height: 60px;
	}

	.business-section {
		padding: 20px;
	}

	.business-name {
		font-size: 24px;
	}

	.food-container {
		padding: 0 15px;
	}

	.food-card {
		padding: 15px;
	}

	.food-img {
		width: 100px;
		height: 100px;
		margin-right: 15px;
	}

	.cart-bar {
		padding: 0 15px;
		height: 70px;
	}

	.checkout-btn {
		padding: 0 20px;
		height: 44px;
		font-size: 14px;
	}
}

@media (max-width: 480px) {
	/* 移动端保持收藏文字显示 */
	.favourite-text {
		display: block;
	}
	.favourite-btn {
		width: auto;
		height: 42px;
		padding: 8px 12px;
		border-radius: 20px;
	}

	.business-meta {
		flex-direction: column;
		gap: 8px;
	}

	.food-card {
		flex-direction: column;
		align-items: flex-start;
	}

	.food-img {
		margin-right: 0;
		margin-bottom: 15px;
	}

	.food-bottom {
		width: 100%;
	}
}
</style>