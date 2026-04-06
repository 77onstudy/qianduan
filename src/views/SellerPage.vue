<template>
  <div class="page">
    <header class="header">
      <button class="header-btn" @click="goBack">返回上一级</button>
      <span>商家信息管理</span>
      <button class="header-btn" @click="logout">退出登录</button>
    </header>
    <main class="main">
      <section v-if="loaded" class="card">
        <div class="grid">
          <label class="field">
            <span>店铺名称</span>
            <input v-model.trim="form.businessName" />
          </label>
          <label class="field">
            <span>店铺地址</span>
            <input v-model.trim="form.businessAddress" />
          </label>
          <label class="field">
            <span>店铺简介</span>
            <input v-model.trim="form.businessExplain" />
          </label>
          <label class="field">
            <span>分类 ID</span>
            <input v-model.number="form.orderTypeId" type="number" />
          </label>
          <label class="field">
            <span>起送价</span>
            <input v-model.number="form.startPrice" type="number" step="0.01" />
          </label>
          <label class="field">
            <span>配送费</span>
            <input v-model.number="form.deliveryPrice" type="number" step="0.01" />
          </label>
          <label class="field field-wide">
            <span>店铺图片</span>
            <input type="file" accept="image/*" @change="handleImageUpload" />
          </label>
          <label class="field field-wide">
            <span>备注</span>
            <input v-model.trim="form.remarks" />
          </label>
        </div>
        <div class="actions">
          <button class="primary" @click="submitForm">保存店铺信息</button>
          <button class="secondary" @click="$router.push('/goodsManage')">商品管理</button>
        </div>
      </section>
      <div v-else class="loading">加载中...</div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'SellerPage',
  data() {
    return {
      loaded: false,
      businessId: null,
      form: {
        businessName: '',
        businessAddress: '',
        businessExplain: '',
        businessImg: '',
        orderTypeId: 1,
        startPrice: 0,
        deliveryPrice: 0,
        remarks: ''
      }
    }
  },
  async mounted() {
    try {
      const user = (await this.$axios.get('/api/user'))?.data?.data
      const business = (await this.$axios.get(`/api/businesses/userId/${user.id}`))?.data?.data
      if (!business?.id) {
        alert('未找到当前商家的店铺信息')
        this.loaded = true
        return
      }
      this.businessId = business.id
      this.form = {
        businessName: business.businessName || '',
        businessAddress: business.businessAddress || '',
        businessExplain: business.businessExplain || '',
        businessImg: business.businessImg || '',
        orderTypeId: Number(business.orderTypeId || 1),
        startPrice: Number(business.startPrice || 0),
        deliveryPrice: Number(business.deliveryPrice || 0),
        remarks: business.remarks || ''
      }
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || '加载商家信息失败')
    } finally {
      this.loaded = true
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }
      this.$router.push('/index')
    },
    logout() {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('seller')
      this.$router.push('/sellerLogin')
    },
    handleImageUpload(event) {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        this.form.businessImg = e.target?.result || ''
      }
      reader.readAsDataURL(file)
    },
    async submitForm() {
      if (!this.businessId) {
        alert('未找到店铺 ID')
        return
      }
      try {
        const response = await this.$axios.put(`/api/businesses/${this.businessId}`, this.form)
        if (response?.data?.success) {
          alert('保存成功')
          return
        }
        alert(response?.data?.message || '保存失败')
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '保存失败')
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.header { height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 16px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); font-size: 22px; }
.header-btn { min-width: 92px; height: 36px; border: none; border-radius: 999px; background: #f3f5f7; color: #334; cursor: pointer; }
.main { padding: 24px 16px; display: flex; justify-content: center; }
.card { width: 100%; max-width: 800px; background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.06); padding: 24px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field { display: grid; gap: 6px; }
.field-wide { grid-column: 1 / -1; }
.field input { height: 42px; border: 1px solid #d9e0e6; border-radius: 10px; padding: 0 12px; }
.actions { display: flex; gap: 12px; margin-top: 24px; }
.primary, .secondary { flex: 1; height: 44px; border: none; border-radius: 10px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #334; }
.loading { padding: 48px; color: #666; }
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; }
  .header { font-size: 18px; }
  .header-btn { min-width: 84px; }
}
</style>
