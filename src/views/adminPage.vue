<template>
  <div class="page">
    <header class="header">
      <button class="header-btn" @click="goBack">返回上一级</button>
      <span>管理员后台</span>
      <button class="header-btn" @click="logout">退出登录</button>
    </header>
    <main class="main">
      <section class="card">
        <h3>创建商家账号</h3>
        <div class="grid">
          <label class="field">
            <span>商家用户名</span>
            <input v-model.trim="merchantForm.username" />
          </label>
          <label class="field">
            <span>商家密码</span>
            <input v-model="merchantForm.password" type="password" placeholder="默认 123456" />
          </label>
        </div>
        <div class="actions">
          <button class="primary" @click="createMerchant">创建商家账号</button>
          <button class="secondary" @click="fillLastMerchant">使用最近创建的商家</button>
        </div>
        <p class="tip" v-if="lastCreatedMerchant">
          最近创建成功的商家账号：
          `{{ lastCreatedMerchant.username }}`，
          用户 ID：`{{ lastCreatedMerchant.id }}`
        </p>
      </section>

      <section class="card">
        <h3>创建店铺</h3>
        <div class="grid">
          <label class="field">
            <span>店铺名称</span>
            <input v-model.trim="form.businessName" />
          </label>
          <label class="field">
            <span>店主用户 ID</span>
            <input v-model.number="form.businessOwnerUserId" type="number" />
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
            <span>地址</span>
            <input v-model.trim="form.businessAddress" />
          </label>
          <label class="field field-wide">
            <span>简介</span>
            <input v-model.trim="form.businessExplain" />
          </label>
          <label class="field field-wide">
            <span>图片 URL / Base64</span>
            <input v-model.trim="form.businessImg" />
          </label>
          <label class="field field-wide">
            <span>备注</span>
            <input v-model.trim="form.remarks" />
          </label>
        </div>
        <div class="actions">
          <button class="primary" @click="createBusiness">创建店铺</button>
          <button class="secondary" @click="loadBusinesses">刷新列表</button>
        </div>
      </section>

      <section class="card">
        <h3>店铺列表</h3>
        <div class="list">
          <div v-for="item in businesses" :key="item.id" class="item">
            <div>
              <strong>{{ item.businessName }}</strong>
              <div class="muted">{{ item.businessAddress || '暂无地址' }}</div>
              <div class="muted">店主用户 ID：{{ item.businessOwnerUserId || '-' }}</div>
            </div>
            <div class="item-actions">
              <button class="secondary" @click="$router.push({ name: 'AdminBusinessEdit', params: { id: item.id } })">编辑</button>
              <button class="danger" @click="deleteBusiness(item.id)">删除</button>
            </div>
          </div>
          <div v-if="!businesses.length" class="muted">暂无数据</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminPage',
  data() {
    return {
      businesses: [],
      lastCreatedMerchant: null,
      merchantForm: {
        username: '',
        password: '123456'
      },
      form: {
        businessName: '',
        businessOwnerUserId: null,
        businessAddress: '',
        businessExplain: '',
        businessImg: '',
        orderTypeId: null,
        startPrice: 0,
        deliveryPrice: 0,
        remarks: ''
      }
    }
  },
  mounted() {
    this.loadBusinesses()
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
      sessionStorage.removeItem('admin')
      this.$router.push('/adminLogin')
    },
    fillLastMerchant() {
      if (!this.lastCreatedMerchant?.id) {
        alert('还没有可用的商家账号，请先创建商家账号')
        return
      }
      this.form.businessOwnerUserId = this.lastCreatedMerchant.id
    },
    async loadBusinesses() {
      try {
        this.businesses = (await this.$axios.get('/api/businesses/all'))?.data?.data || []
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '加载店铺失败')
      }
    },
    async createMerchant() {
      if (!this.merchantForm.username) {
        alert('请填写商家用户名')
        return
      }
      try {
        const response = await this.$axios.post('/api/persons', {
          username: this.merchantForm.username,
          password: this.merchantForm.password || '123456'
        })
        if (!response?.data?.success) {
          alert(response?.data?.message || '创建商家账号失败')
          return
        }
        const merchant = response.data.data
        this.lastCreatedMerchant = {
          id: merchant?.id,
          username: merchant?.username
        }
        this.form.businessOwnerUserId = merchant?.id || null
        alert(`商家账号创建成功，用户 ID：${merchant?.id}，默认可直接用于创建店铺`)
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '创建商家账号失败')
      }
    },
    async createBusiness() {
      if (!this.form.businessName || !this.form.businessOwnerUserId || !this.form.orderTypeId) {
        alert('请填写店铺名称、店主用户 ID 和分类 ID')
        return
      }
      try {
        const response = await this.$axios.post('/api/businesses', this.form)
        if (response?.data?.success) {
          alert('店铺创建成功')
          await this.loadBusinesses()
          return
        }
        alert(response?.data?.message || '创建店铺失败')
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '创建店铺失败')
      }
    },
    async deleteBusiness(id) {
      if (!confirm('确认删除该店铺吗？')) return
      try {
        const response = await this.$axios.delete(`/api/businesses/${id}`)
        if (response?.data?.success) {
          await this.loadBusinesses()
          return
        }
        alert(response?.data?.message || '删除失败')
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
.main { max-width: 960px; margin: 0 auto; padding: 24px 16px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.06); padding: 24px; margin-bottom: 16px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.field { display: grid; gap: 6px; }
.field-wide { grid-column: 1 / -1; }
.field input { height: 42px; border: 1px solid #d9e0e6; border-radius: 10px; padding: 0 12px; }
.actions { display: flex; gap: 12px; margin-top: 24px; }
.primary, .secondary, .danger { height: 42px; border: none; border-radius: 10px; cursor: pointer; padding: 0 16px; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #334; }
.danger { background: #ef4444; color: #fff; }
.list { display: grid; gap: 12px; }
.item { display: flex; justify-content: space-between; align-items: center; gap: 16px; border: 1px solid #eef2f5; border-radius: 12px; padding: 12px 16px; }
.item-actions { display: flex; gap: 8px; }
.muted, .tip { color: #667085; }
@media (max-width: 768px) {
  .header { font-size: 18px; }
  .header-btn { min-width: 84px; }
  .grid { grid-template-columns: 1fr; }
  .item { flex-direction: column; align-items: flex-start; }
}
</style>
