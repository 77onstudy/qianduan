<template>
  <div class="page">
    <header class="header">
      <button class="back" @click="$router.go(-1)">&lt;</button>
      <div class="title">{{ business.businessName || '商家详情' }}</div>
      <button class="fav" @click="toggleFavourite">{{ isFavourited ? '已收藏' : '收藏' }}</button>
    </header>

    <main class="main">
      <section class="business-card">
        <img v-if="business.businessImg" :src="business.businessImg" class="cover" alt="business" />
        <div class="info">
          <h2>{{ business.businessName }}</h2>
          <p>{{ business.businessExplain || '暂无简介' }}</p>
          <div class="price-line">起送 ¥{{ money(business.startPrice) }} / 配送 ¥{{ money(business.deliveryPrice) }}</div>
        </div>
      </section>

      <section class="food-list">
        <div v-for="item in foods" :key="item.id" class="food-item">
          <img v-if="item.foodImg" :src="item.foodImg" class="food-img" alt="food" />
          <div class="food-info">
            <div class="food-name">{{ item.foodName }}</div>
            <div class="food-desc">{{ item.foodExplain || '暂无描述' }}</div>
            <div class="food-bottom">
              <span>¥{{ money(item.foodPrice) }}</span>
              <div class="controls">
                <button v-if="item.quantity > 0" @click="changeQuantity(item, -1)">-</button>
                <span v-if="item.quantity > 0">{{ item.quantity }}</span>
                <button @click="changeQuantity(item, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="cart-bar">
      <div>合计 ¥{{ money(totalPrice) }}</div>
      <button :disabled="totalQuantity === 0 || totalPrice + Number(business.deliveryPrice || 0) < Number(business.startPrice || 0)" @click="goOrder">
        去结算
      </button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'BusinessInfo',
  data() {
    return {
      businessId: Number(this.$route.query.businessId),
      business: {},
      foods: [],
      isFavourited: false
    }
  },
  computed: {
    totalQuantity() {
      return this.foods.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    },
    totalPrice() {
      return this.foods.reduce((sum, item) => sum + Number(item.foodPrice || 0) * Number(item.quantity || 0), 0)
    }
  },
  async mounted() {
    if (!this.businessId) {
      alert('商家ID无效')
      this.$router.push('/businessList')
      return
    }

    try {
      await Promise.all([this.loadBusiness(), this.loadFoods(), this.loadFavouriteStatus()])
      await this.loadCart()
    } catch (error) {
      console.error(error)
    }
  },
  methods: {
    money(value) {
      return Number(value || 0).toFixed(2)
    },
    async loadBusiness() {
      const response = await this.$axios.get(`/api/businesses/${this.businessId}`)
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || '加载商家失败')
      }
      this.business = response.data.data
    },
    async loadFoods() {
      const response = await this.$axios.get('/api/foods', { params: { business: this.businessId } })
      this.foods = (response?.data?.data || []).map(item => ({
        ...item,
        quantity: 0,
        cartId: null
      }))
    },
    async loadCart() {
      const response = await this.$axios.get(`/api/carts/${this.businessId}`)
      const items = response?.data?.data?.items || []
      const cartMap = new Map(items.map(item => [Number(item.foodId), item]))
      this.foods = this.foods.map(food => {
        const cart = cartMap.get(Number(food.id))
        return {
          ...food,
          quantity: cart ? Number(cart.quantity) : 0,
          cartId: cart?.id || null
        }
      })
    },
    async loadFavouriteStatus() {
      try {
        const response = await this.$axios.get('/api/love')
        const list = response?.data?.data || []
        this.isFavourited = list.some(item => Number(item.businessId || item.id) === this.businessId)
      } catch (error) {
        this.isFavourited = false
      }
    },
    async toggleFavourite() {
      try {
        if (this.isFavourited) {
          await this.$axios.delete(`/api/love/${this.businessId}`)
          this.isFavourited = false
        } else {
          await this.$axios.post(`/api/love/${this.businessId}`)
          this.isFavourited = true
        }
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '收藏操作失败')
      }
    },
    async changeQuantity(food, delta) {
      try {
        if (delta > 0) {
          const response = await this.$axios.post('/api/carts', {
            foodId: food.id,
            quantity: delta
          })
          if (!response?.data?.success) {
            alert(response?.data?.message || '加入购物车失败')
            return
          }
        } else if (food.cartId && food.quantity + delta > 0) {
          const response = await this.$axios.patch(`/api/carts/${food.cartId}`, null, {
            params: { quantity: food.quantity + delta }
          })
          if (!response?.data?.success) {
            alert(response?.data?.message || '修改购物车失败')
            return
          }
        } else if (food.cartId && food.quantity + delta <= 0) {
          const response = await this.$axios.delete(`/api/carts/${food.cartId}`)
          if (!response?.data?.success) {
            alert(response?.data?.message || '删除购物车失败')
            return
          }
        } else {
          return
        }

        await this.loadCart()
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '购物车操作失败')
      }
    },
    goOrder() {
      this.$router.push({ path: '/orders', query: { businessId: this.businessId } })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: 88px; }
.header { height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 16px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); position: sticky; top: 0; }
.back, .fav { border: none; background: #f3f5f7; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.title { flex: 1; text-align: center; font-size: 20px; }
.main { max-width: 960px; margin: 0 auto; padding: 16px; }
.business-card, .food-item { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); }
.business-card { padding: 20px; display: flex; gap: 16px; margin-bottom: 16px; }
.cover { width: 140px; height: 140px; object-fit: cover; border-radius: 12px; }
.info { display: grid; gap: 8px; }
.food-list { display: grid; gap: 12px; }
.food-item { padding: 16px; display: flex; gap: 16px; }
.food-img { width: 88px; height: 88px; object-fit: cover; border-radius: 12px; }
.food-info { flex: 1; display: grid; gap: 8px; }
.food-bottom { display: flex; justify-content: space-between; align-items: center; }
.controls { display: flex; align-items: center; gap: 10px; }
.controls button { width: 32px; height: 32px; border: none; border-radius: 50%; background: #8faca5; color: #fff; cursor: pointer; }
.cart-bar { position: fixed; left: 0; right: 0; bottom: 0; height: 72px; background: #fff; box-shadow: 0 -1px 8px rgba(0,0,0,.08); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
.cart-bar button { height: 44px; padding: 0 20px; border: none; border-radius: 10px; background: #8faca5; color: #fff; cursor: pointer; }
.cart-bar button:disabled { background: #cbd5dc; cursor: not-allowed; }
@media (max-width: 768px) { .business-card, .food-item { flex-direction: column; } .cover, .food-img { width: 100%; height: 180px; } }
</style>
