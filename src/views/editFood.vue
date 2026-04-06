<template>
  <div class="page">
    <header class="header">
      <button class="header-btn" @click="goBack">返回上一级</button>
      <span>编辑商品</span>
      <button class="header-btn" @click="$router.push('/goodsManage')">商品列表</button>
    </header>
    <main class="main">
      <section class="card">
        <label class="field">
          <span>名称</span>
          <input v-model.trim="form.foodName" />
        </label>
        <label class="field">
          <span>简介</span>
          <input v-model.trim="form.foodExplain" />
        </label>
        <label class="field">
          <span>价格</span>
          <input v-model.number="form.foodPrice" type="number" step="0.01" />
        </label>
        <label class="field">
          <span>备注</span>
          <input v-model.trim="form.remarks" />
        </label>
        <label class="field">
          <span>图片</span>
          <input type="file" accept="image/*" @change="handleImageUpload" />
        </label>
        <button class="primary" @click="submit">保存</button>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'EditFood',
  data() {
    return {
      foodId: Number(this.$route.query.foodId),
      form: {
        foodName: '',
        foodExplain: '',
        foodImg: '',
        foodPrice: 0,
        remarks: ''
      }
    }
  },
  async mounted() {
    try {
      const response = await this.$axios.get(`/api/foods/${this.foodId}`)
      this.form = {
        foodName: response?.data?.data?.foodName || '',
        foodExplain: response?.data?.data?.foodExplain || '',
        foodImg: response?.data?.data?.foodImg || '',
        foodPrice: Number(response?.data?.data?.foodPrice || 0),
        remarks: response?.data?.data?.remarks || ''
      }
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
      this.$router.push('/goodsManage')
    },
    handleImageUpload(event) {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        this.form.foodImg = e.target?.result || ''
      }
      reader.readAsDataURL(file)
    },
    async submit() {
      try {
        const response = await this.$axios.patch(`/api/foods/${this.foodId}`, this.form)
        if (!response?.data?.success) {
          alert(response?.data?.message || '保存失败')
          return
        }
        this.$router.push('/goodsManage')
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
.main { max-width: 720px; margin: 0 auto; padding: 16px; }
.card { background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.05); padding: 20px; display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.field input { height: 42px; border: 1px solid #d9e0e6; border-radius: 10px; padding: 0 12px; }
.primary { height: 44px; border: none; border-radius: 10px; background: #8faca5; color: #fff; cursor: pointer; }
@media (max-width: 768px) {
  .header { font-size: 18px; }
  .header-btn { min-width: 84px; }
}
</style>
