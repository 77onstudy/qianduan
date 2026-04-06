<template>
  <div class="page">
    <header class="header">确认订单</header>
    <main class="main">
      <section class="card">
        <h3>配送地址</h3>
        <div class="address" @click="selectAddress">
          {{ selectedAddress?.address || '请选择配送地址' }}
        </div>
      </section>

      <section class="card">
        <h3>{{ business.businessName || '商家信息' }}</h3>
        <div v-for="item in cartItems" :key="item.id" class="row">
          <span>{{ item.foodName }}</span>
          <span>x{{ item.quantity }} / ¥{{ money(item.foodPrice * item.quantity) }}</span>
        </div>
        <div class="row total">
          <span>配送费</span>
          <span>¥{{ money(business.deliveryPrice) }}</span>
        </div>
        <div class="row total">
          <span>总计</span>
          <span>¥{{ money(totalPrice) }}</span>
        </div>
      </section>

      <button class="primary" @click="createOrder">去支付</button>
    </main>
  </div>
</template>

<script>
export default {
  name: 'OrdersPage',
  data() {
    return {
      businessId: Number(this.$route.query.businessId),
      business: {},
      cartItems: [],
      selectedAddress: this.$getLocalStorage('selectedDeliveryAddress')
    }
  },
  computed: {
    totalPrice() {
      const goodsTotal = this.cartItems.reduce((sum, item) => sum + Number(item.foodPrice || 0) * Number(item.quantity || 0), 0)
      return goodsTotal + Number(this.business.deliveryPrice || 0)
    }
  },
  async mounted() {
    try {
      await Promise.all([this.loadBusiness(), this.loadCart()])
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || '加载订单确认页失败')
    }
  },
  methods: {
    money(value) {
      return Number(value || 0).toFixed(2)
    },
    async loadBusiness() {
      const response = await this.$axios.get(`/api/businesses/${this.businessId}`)
      this.business = response?.data?.data || {}
    },
    async loadCart() {
      const cartResponse = await this.$axios.get(`/api/carts/${this.businessId}`)
      const cartItems = cartResponse?.data?.data?.items || []
      const foodResponse = await this.$axios.get('/api/foods', { params: { business: this.businessId } })
      const foods = new Map((foodResponse?.data?.data || []).map(item => [Number(item.id), item]))
      this.cartItems = cartItems
        .map(item => {
          const food = foods.get(Number(item.foodId))
          if (!food) return null
          return {
            id: item.id,
            foodId: item.foodId,
            quantity: Number(item.quantity || 0),
            foodName: food.foodName,
            foodPrice: Number(food.foodPrice || 0)
          }
        })
        .filter(Boolean)
    },
    selectAddress() {
      this.$router.push({ path: '/userAddress', query: { businessId: this.businessId } })
    },
    async createOrder() {
      if (!this.selectedAddress?.id) {
        alert('请先选择配送地址')
        return
      }
      if (!this.cartItems.length) {
        alert('购物车为空')
        return
      }

      try {
        const response = await this.$axios.post('/api/orders', {
          businessId: this.businessId,
          addressId: Number(this.selectedAddress.id),
          orderTotal: this.totalPrice
        })
        if (!response?.data?.success) {
          alert(response?.data?.message || '创建订单失败')
          return
        }
        this.$router.push({ path: '/payment', query: { orderId: response.data.data.id } })
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '创建订单失败')
      }
    }
  },
  watch: {
    '$route.query.address': {
      immediate: true,
      handler() {
        this.selectedAddress = this.$getLocalStorage('selectedDeliveryAddress')
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); font-size: 22px; }
.main { max-width: 960px; margin: 0 auto; padding: 16px; display: grid; gap: 16px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 20px; }
.address { margin-top: 12px; padding: 14px; border-radius: 12px; background: #f3f5f7; cursor: pointer; }
.row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2f5; }
.row:last-child { border-bottom: none; }
.total { font-weight: 700; }
.primary { height: 48px; border: none; border-radius: 12px; background: #8faca5; color: #fff; cursor: pointer; }
</style>
