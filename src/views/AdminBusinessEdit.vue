<template>
  <div class="page">
    <header class="header">编辑店铺</header>
    <main class="main">
      <section class="card">
        <label class="field">
          <span>店铺名称</span>
          <input v-model.trim="form.businessName" />
        </label>
        <label class="field">
          <span>地址</span>
          <input v-model.trim="form.businessAddress" />
        </label>
        <label class="field">
          <span>简介</span>
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
        <label class="field">
          <span>图片 URL / Base64</span>
          <input v-model.trim="form.businessImg" />
        </label>
        <label class="field">
          <span>备注</span>
          <input v-model.trim="form.remarks" />
        </label>
        <div class="actions">
          <button class="primary" @click="save">保存</button>
          <button class="secondary" @click="$router.push('/adminPage')">返回</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminBusinessEdit',
  data() {
    return {
      id: Number(this.$route.params.id),
      form: {
        businessName: '',
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
  async mounted() {
    try {
      const response = await this.$axios.get(`/api/businesses/${this.id}`)
      const business = response?.data?.data || {}
      this.form = {
        businessName: business.businessName || '',
        businessAddress: business.businessAddress || '',
        businessExplain: business.businessExplain || '',
        businessImg: business.businessImg || '',
        orderTypeId: business.orderTypeId || null,
        startPrice: Number(business.startPrice || 0),
        deliveryPrice: Number(business.deliveryPrice || 0),
        remarks: business.remarks || ''
      }
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || '加载店铺失败')
    }
  },
  methods: {
    async save() {
      try {
        const response = await this.$axios.put(`/api/businesses/${this.id}`, this.form)
        if (!response?.data?.success) {
          alert(response?.data?.message || '保存失败')
          return
        }
        this.$router.push('/adminPage')
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
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); font-size: 22px; }
.main { max-width: 720px; margin: 0 auto; padding: 16px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 20px; display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.field input { height: 42px; border: 1px solid #d9e0e6; border-radius: 10px; padding: 0 12px; }
.actions { display: flex; gap: 12px; }
.primary, .secondary { flex: 1; height: 44px; border: none; border-radius: 10px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #334; }
</style>
