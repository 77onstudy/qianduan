<template>
	<div class="wrapper">
		<header class="header">
			<i class="fa fa-angle-left header-back" @click="$router.go(-1)"></i>
			<p class="header-title">商家信息</p>
		</header>

		<div class="business-section">
			<div class="business-logo">
				<img 
					class="logo" 
					v-if="business.businessImg" 
					:src="business.businessImg" 
					:alt="business.businessName"
					loading="lazy"
				>
				<div class="logo-placeholder" v-else>
					<i class="fa fa-store"></i>
				</div>
			</div>
			<div class="business-info">
				<h1 class="business-name">{{business.businessName}}</h1>
				<div class="business-meta">
					<span class="meta-item">¥{{formatPrice(business.starPrice)}}起送</span>
					<span class="meta-split">|</span>
					<span class="meta-item">¥{{formatPrice(business.deliveryPrice)}}配送</span>
				</div>
				<p class="business-desc">{{business.businessExplain || '暂无商家介绍'}}</p>
			</div>
		</div>

		<div class="food-container">
			<template v-for="(item,index) in foodArr" :key="item.id || index">
				<div class="food-card" @mouseenter="item.hover = true" @mouseleave="item.hover = false">
					<div class="food-img">
						<img 
							v-if="item.foodImg" 
							:src="item.foodImg" 
							:alt="item.foodName"
							loading="lazy"
						>
						<div class="img-placeholder" v-else>
							<i class="fa fa-utensils"></i>
						</div>
					</div>
					
					<div class="food-info">
						<h3 class="food-name">{{item.foodName}}</h3>
						<p class="food-desc">{{item.foodExplain || '暂无商品描述'}}</p>
						<div class="food-bottom">
							<span class="food-price">¥{{formatPrice(item.foodPrice)}}</span>
							<div class="food-control">
								<button 
									class="control-btn minus-btn" 
									@click="minus(index)" 
									v-show="item.quantity > 0"
									:class="{ 'active': item.hover }"
								>
									<i class="fa fa-minus-circle"></i>
									<span class="btn-text">-</span>
								</button>
								<span class="control-count" v-show="item.quantity > 0">{{item.quantity}}</span>
								<button 
									class="control-btn plus-btn" 
									@click="add(index)"
									:class="{ 'active': item.hover }"
								>
									<i class="fa fa-plus-circle"></i>
									<span class="btn-text">+</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</template>

			<div class="empty-tip" v-if="foodArr.length === 0">
				<div class="empty-content">
					<i class="fa fa-box-open empty-icon"></i>
					<p class="empty-title">该商家暂无商品</p>
					<p class="empty-desc">请稍后再来看看~</p>
				</div>
			</div>
		</div>

		<div class="cart-bar">
			<div class="cart-left">
				<div class="cart-icon" :class="{ 'active': totalQuantity>0 }">
					<i class="fa fa-shopping-cart"></i>
					<div class="cart-badge" v-show="totalQuantity!=0">{{totalQuantity}}</div>
				</div>
				<div class="cart-info">
					<p class="cart-total">¥{{formatPrice(totalPrice)}}</p>
					<p class="cart-delivery">另需配送费 ¥{{formatPrice(business.deliveryPrice)}}</p>
				</div>
			</div>
			<div class="cart-right">
				<div class="checkout-btn disabled" v-show="totalSettle<business.starPrice">
					¥{{formatPrice(business.starPrice)}}起送
				</div>
				<div class="checkout-btn" @click="toOrder" v-show="totalSettle>=business.starPrice" :class="{ 'active': totalQuantity>0 }">
					去结算
				</div>
			</div>
		</div>

		<!-- 👇 右下角悬浮去结算按钮（修复显示问题） -->
		<!-- 临时放宽显示条件：只要页面加载完成就显示（方便测试），后续可改回原条件 -->
		<div 
			class="float-checkout-btn" 
			@click="toOrder" 
			v-show="isLoaded" 
		>
			<i class="fa fa-shopping-bag" style="margin-right: 8px;"></i>
			<span>去结算</span>
			<!-- 小红点提示，增强视觉辨识度 -->
			<div class="float-btn-dot"></div>
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
      defaultStep: 1
    }
  },
  created() {
    this.businessId = this.$route.query.businessId
    if (!this.businessId || isNaN(Number(this.businessId))) {
      alert('商家ID无效，请重新进入页面')
      this.$router.go(-1)
      return
    }

    this.user = this.$getSessionStorage('user')
    const token = sessionStorage.getItem('token')
    if (!this.user?.userId || !token) {
      alert('请先登录！')
      this.$router.push('/login')
      return
    }

    this.config = { headers: { Authorization: `Bearer ${token}` } }
    if (!this.isLoaded) {
      this.loadDataSequence()
      this.isLoaded = true
    }
  },
  computed: {
    totalPrice() {
      return Number(
        this.foodArr.reduce((s, v) => s + (Number(v.foodPrice) || 0) * (v.quantity || 0), 0).toFixed(2)
      )
    },
    totalQuantity() {
      return this.foodArr.reduce((s, v) => s + (v.quantity || 0), 0)
    },
    totalSettle() {
      return Number((this.totalPrice + Number(this.business.deliveryPrice || 0)).toFixed(2))
    }
  },
  methods: {
    formatPrice(p) {
      return (Number(p) || 0).toFixed(2).replace(/\.00$/, '')
    },

    async loadDataSequence() {
      try {
        await this.loadBusinessInfo()
        await this.loadFoodList()
        await this.listCart()
      } catch (e) {
        console.error('【数据加载序列】整体失败：', e)
      }
    },

    async loadBusinessInfo() {
      try {
        const res = await this.$axios.get(`/api/businesses/${Number(this.businessId)}`, this.config)
        if (res.data.success) this.business = res.data.data
        else throw new Error(res.data.message || '获取商家信息失败')
      } catch (e) {
        alert(e.message || '网络错误，无法加载商家信息')
      }
    },

    async loadFoodList() {
      try {
        const res = await this.$axios.get('/api/foods', {
          params: { business: Number(this.businessId) },
          ...this.config
        })
        this.foodArr = (res.data.data || []).map(v => ({
          ...v,
          quantity: 0,
          cartId: null,
          hover: false,
          step: v.step || this.defaultStep
        }))
      } catch (e) {
        alert('网络错误，无法加载商品列表')
      }
    },

    listCart() {
      return new Promise((resolve, reject) => {
        this.$axios
          .get(`/api/carts/${Number(this.businessId)}`, this.config)
          .then(res => {
            if (res.data.success) {
              const items = res.data.data.items || []
              this.foodArr.forEach(f => {
                const m = items.find(i => i.food.id === f.id && Number(i.business.id) === Number(this.businessId))
                f.quantity = m ? m.quantity : 0
                f.cartId = m ? m.id : null
              })
            } else {
              console.error('【加载购物车】失败：', res.data.message)
            }
            resolve()
          })
          .catch(err => {
            this.foodArr.forEach(f => { f.quantity = 0; f.cartId = null })
            reject(err)
          })
      })
    },

    handleCartOperation(index, operation) {
      const food = this.foodArr[index]
      const step = food.step || this.defaultStep
      const ori = food.quantity
      const expect = operation === 'increase' ? ori + step : ori - step
      if (expect < 0) return

      food.quantity = expect   // 乐观更新

      const body = {
        ...(food.cartId && { id: food.cartId }),
        food: { id: food.id, business: { id: Number(this.businessId) } },
        business: { id: Number(this.businessId) },
        operation,
        quantity: operation === 'increase' ? step : -step, // 负值表示减少
        customer: { id: this.user.userId }
      }

      this.$axios
        .post('/api/carts', body, this.config)
        .then(res => {
          if (res.data.success) {
            food.quantity = res.data.data?.quantity ?? food.quantity
            if (!food.cartId && res.data.data?.id) food.cartId = res.data.data.id
          } else {
            food.quantity = ori
            alert(`操作失败：${res.data.message || '服务器处理失败'}`)
          }
        })
        .catch(err => {
          food.quantity = ori
          alert('网络错误，操作失败，请重试')
          console.error(err)
        })
    },

    add(index) {
      this.handleCartOperation(index, 'increase')
    },

    minus(index) {
      const food = this.foodArr[index];
      if (food.quantity <= 0) return;
      const step = food.step || this.defaultStep;
      const newVal = food.quantity - step;
      if (!food.cartId) return;          // 从未加购过

      if (newVal === 0) {
        this.removeCart(index);          // 直接复用删除方法
        return;
      }

      /* 普通减 */
      const oldVal = food.quantity;
      food.quantity = newVal;            // 乐观更新
      this.$axios
        .patch(`/api/carts/${food.cartId}?quantity=${newVal}`, this.config)
        .then(res => {
          if (res.data.success) {
            food.quantity = res.data.data.quantity;
          } else {
            food.quantity = oldVal;
            alert(`减少失败：${res.data.message}`);
          }
        })
        .catch(() => {
          food.quantity = oldVal;
          alert('网络错误，减少失败');
        });
    },

    removeCart(index) {
      const food = this.foodArr[index];
      console.log(`【removeCart】删除商品：ID=${food.id}，cartId=${food.cartId}`);
      
      if (!food.cartId) {
        console.error('【removeCart】失败：未找到购物车项ID（cartId）');
        alert('未找到购物车记录，删除失败');
        return;
      }

      this.$axios.delete(`/api/carts/${food.cartId}`, this.config)
        .then(response => {
          console.log('【removeCart】响应:', response.data);
          if (response.data.success) {
            food.quantity = 0;
            food.cartId = null;
            alert('删除购物车商品成功');
          } else {
            alert(`删除失败：${response.data.message}`);
          }
        })
        .catch(error => {
          console.error('【removeCart】错误:', error);
          alert('网络错误，删除请求失败');
        });
    },

    toOrder() {
      if (this.totalQuantity === 0) {
        alert('请先添加商品到购物车')
        return
      }
      this.$router.push({ path: '/orders', query: { businessId: this.business.id } })
    }
  }
}
</script>

<style scoped>
	/* 原有样式保持不变 */
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	}
	.wrapper {
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding-bottom: 60px;
		background-color: #fafafa;
	}

	.header {
		width: 100%;
		height: 50px;
		background-color: #0097FF;
		color: #fff;
		font-size: 18px;
		font-weight: 500;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		padding: 0 20px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	.header-back {
		font-size: 22px;
		cursor: pointer;
		margin-right: 15px;
		transition: transform 0.2s;
	}
	.header-back:hover {
		transform: scale(1.1);
	}
	.header-title {
		flex: 1;
		text-align: center;
	}

	.business-section {
		width: 100%;
		margin-top: 65px;
		padding: 0 16px;
	}
	.business-logo {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-bottom: 12px;
	}
	.logo {
		width: 40vw;
		height: 40vw;
		max-width: 300px;
		max-height: 300px;
		border-radius: 12px;
		object-fit: cover;
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
	}
	.logo-placeholder {
		width: 40vw;
		height: 40vw;
		max-width: 300px;
		max-height: 300px;
		border-radius: 12px;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 60px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.08);
	}
	.business-info {
		text-align: center;
		padding: 0 16px;
		margin-bottom: 20px;
	}
	.business-name {
		font-size: 22px;
		font-weight: 600;
		color: #333;
		margin-bottom: 8px;
	}
	.business-meta {
		font-size: 16px;
		color: #666;
		margin-bottom: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}
	.meta-split {
		color: #ddd;
	}
	.business-desc {
		font-size: 14px;
		color: #999;
		line-height: 1.5;
		max-width: 600px;
		margin: 0 auto;
	}

	.food-container {
		width: 100%;
		padding: 0 16px;
		margin-bottom: 20px;
	}
	.food-card {
		width: 100%;
		background-color: #fff;
		border-radius: 8px;
		padding: 16px;
		margin-bottom: 12px;
		display: flex;
		gap: 16px;
		box-shadow: 0 2px 6px rgba(0,0,0,0.05);
		transition: box-shadow 0.3s, transform 0.2s;
	}
	.food-card:hover {
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
		transform: translateY(-1px);
	}
	.food-img {
		width: 80px;
		height: 80px;
		border-radius: 8px;
		overflow: hidden;
		background-color: #f5f5f5;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.food-img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.img-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		font-size: 32px;
	}
	.food-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.food-name {
		font-size: 17px;
		font-weight: 500;
		color: #333;
		margin-bottom: 6px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.food-desc {
		font-size: 13px;
		color: #999;
		line-height: 1.3;
		margin-bottom: 10px;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.food-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.food-price {
		font-size: 18px;
		font-weight: 600;
		color: #3190E8;
	}
	.food-control {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 16px;
		transition: color 0.2s, transform 0.2s, background-color 0.2s;
		padding: 4px 8px;
		border-radius: 4px;
	}
	.minus-btn {
		color: #ff6b6b;
	}
	.minus-btn.active, .minus-btn:hover {
		color: #ff4444;
		background-color: rgba(255, 68, 68, 0.05);
	}
	.plus-btn {
		color: #3190E8;
	}
	.plus-btn.active, .plus-btn:hover {
		color: #0097FF;
		background-color: rgba(0, 151, 255, 0.05);
	}
	.btn-text {
		font-size: 14px;
		font-weight: 500;
	}
	.control-count {
		font-size: 15px;
		color: #333;
		width: 28px;
		text-align: center;
	}

	.empty-tip {
		width: 100%;
		height: 220px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 20px;
	}
	.empty-content {
		text-align: center;
	}
	.empty-icon {
		font-size: 60px;
		color: #eee;
		margin-bottom: 16px;
		animation: float 2s ease-in-out infinite;
	}
	.empty-title {
		font-size: 16px;
		color: #666;
		margin-bottom: 8px;
	}
	.empty-desc {
		font-size: 14px;
		color: #999;
	}
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	.cart-bar {
		width: 100%;
		height: 60px;
		background-color: #fff;
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
	}
	.cart-left {
		flex: 2;
		display: flex;
		align-items: center;
		padding: 0 20px;
	}
	.cart-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: #505051;
		color: #fff;
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;
		position: relative;
		transition: background-color 0.3s;
	}
	.cart-icon.active {
		background-color: #3190E8;
	}
	.cart-badge {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: #ff4444;
		color: #fff;
		font-size: 12px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: -5px;
		right: -5px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
	}
	.cart-info {
	}
	.cart-total {
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}
	.cart-delivery {
		font-size: 12px;
		color: #999;
	}
	.cart-right {
		flex: 1;
		padding: 0 16px;
	}
	.checkout-btn {
		width: 100%;
		height: 40px;
		background-color: #38CA73;
		color: #fff;
		font-size: 16px;
		font-weight: 500;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background-color 0.3s, transform 0.2s;
		border: none;
	}
	.checkout-btn:hover {
		background-color: #2db866;
		transform: scale(1.02);
	}
	.checkout-btn.disabled {
		background-color: #535356;
		cursor: default;
		transform: none;
		opacity: 0.8;
	}

	/* 👇 修复后的悬浮按钮样式：增强视觉突出度 */
	.float-checkout-btn {
		position: fixed;
		right: 20px;
		bottom: 100px; /* 提高位置，远离底部栏，避免遮挡 */
		z-index: 1001; /* 高于底部栏z-index，确保不被覆盖 */
		background-color: #FF5722; /* 改用橙色，与底部绿色区分，更显眼 */
		color: #fff;
		font-size: 16px;
		font-weight: 600;
		padding: 14px 24px;
		border-radius: 30px;
		box-shadow: 0 6px 16px rgba(255, 87, 34, 0.4); /* 加深阴影，增强立体感 */
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		border: 2px solid #fff; /* 加白色边框，增强边缘识别 */
	}
	/*  hover效果强化 */
	.float-checkout-btn:hover {
		background-color: #FF4500;
		transform: scale(1.1);
		box-shadow: 0 8px 20px rgba(255, 87, 34, 0.5);
	}
	/* 小红点提示，进一步吸引注意 */
	.float-btn-dot {
		position: absolute;
		top: -5px;
		right: -5px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background-color: #ff4444;
		border: 2px solid #fff;
	}

	/* 移动端适配：确保小屏幕也能清晰看到 */
	@media (max-width: 375px) {
		.business-name {
			font-size: 20px;
		}
		.business-meta {
			font-size: 14px;
			gap: 8px;
		}
		.food-name {
			font-size: 16px;
		}
		.cart-left {
			padding: 0 16px;
		}
		.float-checkout-btn {
			right: 16px;
			bottom: 90px;
			padding: 12px 20px;
			font-size: 15px;
		}
	}

	@media (min-width: 1200px) {
		.business-section, .food-container {
			max-width: 1200px;
			margin-left: auto;
			margin-right: auto;
		}
		.business-logo {
			margin-bottom: 16px;
		}
	}
</style>