<template>
  <div class="page">
    <header class="header">在线支付</header>
    <main class="main">
      <section class="card">
        <div class="row">
          <span>{{ order.business?.businessName || '订单' }}</span>
          <strong>¥{{ money(order.orderTotal) }}</strong>
        </div>
        <div v-for="item in order.orderDetails || []" :key="item.id" class="row">
          <span>{{ item.food?.foodName }}</span>
          <span>x{{ item.quantity }}</span>
        </div>
      </section>

      <section class="card">
        <h3>支付方式</h3>
        <div class="payment-types">
          <button :class="{ active: paymentType === 'wechat' }" @click="paymentType = 'wechat'">微信支付</button>
          <button :class="{ active: paymentType === 'alipay' }" @click="paymentType = 'alipay'">支付宝</button>
        </div>
      </section>

      <button class="primary" @click="payOrder">确认支付</button>
    </main>
  </div>
</template>

<script>
export default {
  name: 'PaymentPage',
  data() {
    return {
      orderId: Number(this.$route.query.orderId),
      order: {},
      paymentType: 'wechat'
    }
  },
  async mounted() {
    try {
      const response = await this.$axios.get(`/api/orders/${this.orderId}`)
      if (!response?.data?.success) {
        alert(response?.data?.message || '加载订单失败')
        return
      }
      this.order = response.data.data || {}
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || '加载订单失败')
    }
  },
  methods: {
    money(value) {
      return Number(value || 0).toFixed(2)
    },
    async payOrder() {
      try {
        const response = await this.$axios.patch('/api/orders/pay', { id: this.orderId, paymentType: this.paymentType })
        if (!response?.data?.success) {
          alert(response?.data?.message || '支付失败')
          return
        }
        this.$router.push('/orderList')
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '支付失败')
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #8faca5; color: #fff; font-size: 22px; }
.main { max-width: 960px; margin: 0 auto; padding: 16px; display: grid; gap: 16px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 20px; }
.row { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eef2f5; }
.row:last-child { border-bottom: none; }
.payment-types { display: grid; gap: 12px; margin-top: 12px; }
.payment-types button, .primary { height: 44px; border: none; border-radius: 10px; cursor: pointer; }
.payment-types button { background: #f3f5f7; color: #334; }
.payment-types button.active { background: #dbe9e3; color: #244; }
.primary { background: #8faca5; color: #fff; }
</style>
