<template>
  <div class="page">
    <header class="header">
      <button class="header-btn" @click="goBack">返回上一级</button>
      <span>商品管理</span>
      <button class="header-btn" @click="$router.push('/sellerPage')">店铺信息</button>
    </header>
    <main class="main">
      <button class="primary add" @click="$router.push('/addFood')">新增商品</button>
      <section class="card" v-for="food in foods" :key="food.id">
        <div class="info">
          <strong>{{ food.foodName }}</strong>
          <div class="muted">{{ food.foodExplain || '暂无描述' }}</div>
          <div>￥{{ money(food.foodPrice) }}</div>
        </div>
        <div class="actions">
          <button class="secondary" @click="$router.push({ path: '/editFood', query: { foodId: food.id } })">编辑</button>
          <button class="danger" @click="deleteFood(food.id)">删除</button>
        </div>
      </section>
      <div v-if="!foods.length" class="empty">暂无商品</div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'GoodsManage',
  data() {
    return {
      businessId: null,
      foods: []
    }
  },
  async mounted() {
    try {
      const user = (await this.$axios.get('/api/user'))?.data?.data
      const business = (await this.$axios.get(`/api/businesses/userId/${user.id}`))?.data?.data
      this.businessId = business?.id
      const foodResponse = await this.$axios.get('/api/foods', { params: { business: this.businessId } })
      this.foods = foodResponse?.data?.data || []
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || '加载商品失败')
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }
      this.$router.push('/sellerPage')
    },
    money(value) {
      return Number(value || 0).toFixed(2)
    },
    async deleteFood(id) {
      if (!confirm('确认删除该商品吗？')) return
      try {
        const response = await this.$axios.delete(`/api/foods/${id}`)
        if (!response?.data?.success) {
          alert(response?.data?.message || '删除失败')
          return
        }
        this.foods = this.foods.filter(item => item.id !== id)
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '删除失败')
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.header { height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 16px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); font-size: 22px; }
.header-btn { min-width: 92px; height: 36px; border: none; border-radius: 999px; background: #f3f5f7; color: #334; cursor: pointer; }
.main { max-width: 960px; margin: 0 auto; padding: 16px; display: grid; gap: 12px; }
.add { width: 100%; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 16px; display: flex; justify-content: space-between; gap: 12px; }
.actions { display: flex; gap: 8px; }
.primary, .secondary, .danger { height: 40px; border: none; border-radius: 10px; padding: 0 16px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #334; }
.danger { background: #ef4444; color: #fff; }
.muted, .empty { color: #667085; }
@media (max-width: 768px) {
  .header { font-size: 18px; }
  .header-btn { min-width: 84px; }
  .card { flex-direction: column; }
}
</style>
