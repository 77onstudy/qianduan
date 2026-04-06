<template>
  <div class="page">
    <header class="header">地址管理</header>
    <main class="main">
      <section v-for="item in addresses" :key="item.id" class="card">
        <div class="info" @click="selectAddress(item)">
          <strong>{{ item.contactName }} {{ item.contactTel }}</strong>
          <div class="muted">{{ item.address }}</div>
        </div>
        <div class="actions">
          <button class="secondary" @click.stop="editAddress(item.id)">编辑</button>
          <button class="danger" @click.stop="deleteAddress(item.id)">删除</button>
        </div>
      </section>
      <div v-if="!addresses.length" class="empty">暂无地址</div>
      <button class="primary" @click="$router.push({ path: '/addUserAddress', query: { businessId } })">新增地址</button>
    </main>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '../components/NavFooter.vue'

export default {
  name: 'UserAddress',
  components: { NavFooter },
  data() {
    return {
      businessId: this.$route.query.businessId,
      addresses: []
    }
  },
  async mounted() {
    await this.loadAddresses()
  },
  methods: {
    async loadAddresses() {
      try {
        const response = await this.$axios.get('/api/addresses')
        this.addresses = response?.data?.data || []
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '加载地址失败')
      }
    },
    selectAddress(address) {
      this.$setLocalStorage('selectedDeliveryAddress', address)
      if (this.businessId) {
        this.$router.push({ path: '/orders', query: { businessId: this.businessId } })
      }
    },
    editAddress(addressId) {
      this.$router.push({ path: '/editUserAddress', query: { addressId, businessId: this.businessId } })
    },
    async deleteAddress(addressId) {
      if (!confirm('确认删除该地址吗？')) return
      try {
        const response = await this.$axios.delete(`/api/addresses/${addressId}`)
        if (!response?.data?.success) {
          alert(response?.data?.message || '删除失败')
          return
        }
        this.addresses = this.addresses.filter(item => item.id !== addressId)
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '删除失败')
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: 88px; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); font-size: 22px; }
.main { max-width: 960px; margin: 0 auto; padding: 16px; display: grid; gap: 12px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 16px; display: flex; justify-content: space-between; gap: 12px; }
.info { flex: 1; cursor: pointer; }
.actions { display: flex; gap: 8px; }
.primary, .secondary, .danger { height: 40px; border: none; border-radius: 10px; padding: 0 16px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #334; }
.danger { background: #ef4444; color: #fff; }
.muted, .empty { color: #667085; }
</style>
