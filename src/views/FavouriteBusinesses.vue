<template>
  <div class="page">
    <header class="header">我的收藏</header>
    <main class="main">
      <section v-for="item in businesses" :key="item.id" class="card" @click="goToBusinessInfo(item.id)">
        <img v-if="item.businessImg" :src="item.businessImg" class="cover" alt="business" />
        <div class="info">
          <strong>{{ item.businessName }}</strong>
          <div class="muted">{{ item.businessExplain || '暂无简介' }}</div>
        </div>
      </section>
      <div v-if="!businesses.length" class="empty">暂无收藏商家</div>
    </main>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue'

export default {
  name: 'FavouriteBusinesses',
  components: { NavFooter },
  data() {
    return {
      businesses: []
    }
  },
  async mounted() {
    try {
      const response = await this.$axios.get('/api/love')
      const list = response?.data?.data || []
      const ids = list.map(item => Number(item.businessId || item.id)).filter(Boolean)
      const results = await Promise.all(ids.map(id => this.$axios.get(`/api/businesses/${id}`)))
      this.businesses = results
        .map(result => result?.data?.data)
        .filter(Boolean)
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || '加载收藏失败')
    }
  },
  methods: {
    goToBusinessInfo(id) {
      this.$router.push({ path: '/businessInfo', query: { businessId: id } })
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; padding-bottom: 88px; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); font-size: 22px; }
.main { max-width: 960px; margin: 0 auto; padding: 16px; display: grid; gap: 12px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 16px; display: flex; gap: 16px; cursor: pointer; }
.cover { width: 96px; height: 96px; object-fit: cover; border-radius: 12px; }
.info { display: grid; gap: 8px; }
.muted, .empty { color: #667085; }
</style>
