<template>
  <div class="page">
    <header class="header">新增地址</header>
    <main class="main">
      <section class="card">
        <label class="field">
          <span>联系人</span>
          <input v-model.trim="form.contactName" />
        </label>
        <label class="field">
          <span>性别</span>
          <select v-model.number="form.contactSex">
            <option :value="0">先生</option>
            <option :value="1">女士</option>
          </select>
        </label>
        <label class="field">
          <span>电话</span>
          <input v-model.trim="form.contactTel" />
        </label>
        <label class="field">
          <span>地址</span>
          <input v-model.trim="form.address" />
        </label>
        <button class="primary" @click="submit">保存</button>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AddUserAddress',
  data() {
    return {
      businessId: this.$route.query.businessId,
      form: {
        contactName: '',
        contactSex: 0,
        contactTel: '',
        address: ''
      }
    }
  },
  methods: {
    async submit() {
      try {
        const response = await this.$axios.post('/api/addresses', this.form)
        if (!response?.data?.success) {
          alert(response?.data?.message || '保存失败')
          return
        }
        this.$router.push({ path: '/userAddress', query: { businessId: this.businessId } })
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
.field input, .field select { height: 42px; border: 1px solid #d9e0e6; border-radius: 10px; padding: 0 12px; }
.primary { height: 44px; border: none; border-radius: 10px; background: #8faca5; color: #fff; cursor: pointer; }
</style>
