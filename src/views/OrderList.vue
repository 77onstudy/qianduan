<template>
  <div class="page">
    <header class="header">我的订单</header>
    <main class="main">
      <section class="card" v-for="order in orders" :key="order.id">
        <div class="row">
          <div>
            <strong>{{ order.business?.businessName || '订单' }}</strong>
            <div class="muted">状态：{{ statusText(order.orderState) }}</div>
          </div>
          <div class="price">¥{{ money(order.orderTotal) }}</div>
        </div>
        <div v-for="item in order.orderDetails || []" :key="item.id" class="detail">
          <span>{{ item.food?.foodName }}</span>
          <span>x{{ item.quantity }}</span>
        </div>
        <div class="actions">
          <button v-if="order.orderState === 0" class="primary" @click="goToPayment(order.id)">去支付</button>
          <button v-if="order.orderState === 1" class="secondary" @click="confirmReceive(order.id)">确认收货</button>
        </div>
      </section>
      <div v-if="!orders.length" class="empty">暂无订单</div>
    </main>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '../components/NavFooter.vue'

export default {
  name: 'OrderList',
  components: { NavFooter },
  data() {
    return {
      orders: []
    }
  },
  async mounted() {
    const user = this.$getSessionStorage('user')
    if (!user?.userId) {
      this.$router.push('/login')
      return
    }

    try {
      const response = await this.$axios.get(`/api/orders/userOrder/${user.userId}`)
      this.orders = response?.data?.data || []
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || '加载订单失败')
    }
  },
  methods: {
    money(value) {
      return Number(value || 0).toFixed(2)
    },
    statusText(status) {
      if (status === 0) return '待支付'
      if (status === 1) return '待收货'
      if (status === 3) return '已完成'
      return '未知状态'
    },
    goToPayment(orderId) {
      this.$router.push({ path: '/payment', query: { orderId } })
    },
    async confirmReceive(orderId) {
      try {
        const response = await this.$axios.patch(`/api/orders/confirm/${orderId}`)
        if (!response?.data?.success) {
          alert(response?.data?.message || '确认收货失败')
          return
        }
        this.orders = this.orders.map(order =>
          order.id === orderId ? { ...order, orderState: 3 } : order
        )
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '确认收货失败')
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: 88px; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #8faca5; color: #fff; font-size: 22px; }
.main { max-width: 960px; margin: 0 auto; padding: 16px; display: grid; gap: 16px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 20px; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.detail { display: flex; justify-content: space-between; gap: 12px; padding-top: 10px; color: #475467; }
.actions { display: flex; gap: 12px; margin-top: 16px; }
.primary, .secondary { height: 40px; border: none; border-radius: 10px; padding: 0 16px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #334; }
.muted, .empty { color: #667085; }
.price { font-weight: 700; }
</style>
