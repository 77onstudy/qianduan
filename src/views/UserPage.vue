<template>
  <div class="page">
    <header class="header">个人中心</header>
    <main class="main">
      <section class="card">
        <div class="row">
          <span>用户名</span>
          <strong>{{ user.userName || '-' }}</strong>
        </div>
        <div class="row edit-row">
          <span>新密码</span>
          <input v-model="password" class="input" type="password" placeholder="输入新密码后保存" />
        </div>
        <div class="actions">
          <button class="primary" @click="savePassword">修改密码</button>
          <button class="secondary" @click="$router.push('/favouriteBusinesses')">我的收藏</button>
          <button class="secondary" @click="$router.push('/userAddress')">我的地址</button>
          <button class="secondary" @click="logout">退出登录</button>
        </div>
      </section>
    </main>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue'

export default {
  name: 'UserPage',
  components: { NavFooter },
  data() {
    return {
      user: this.$getSessionStorage('user') || {},
      password: ''
    }
  },
  methods: {
    async savePassword() {
      if (!this.user?.userName || !this.password) {
        alert('请输入新密码')
        return
      }
      try {
        const response = await this.$axios.post('/api/password', {
          username: this.user.userName,
          password: this.password
        })
        if (response?.data?.success) {
          this.password = ''
          alert('密码修改成功')
          return
        }
        alert(response?.data?.message || '密码修改失败')
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '密码修改失败')
      }
    },
    logout() {
      sessionStorage.removeItem('token')
      this.$removeSessionStorage('user')
      this.$removeSessionStorage('seller')
      this.$removeSessionStorage('admin')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #fcfcfa; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.06); font-size: 22px; }
.main { padding: 24px 16px 100px; display: flex; justify-content: center; }
.card { width: 100%; max-width: 720px; background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.06); padding: 24px; }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; }
.edit-row { align-items: center; }
.input { flex: 1; max-width: 360px; height: 42px; border: 1px solid #d9e0e6; border-radius: 10px; padding: 0 12px; }
.actions { display: grid; gap: 12px; margin-top: 24px; }
.primary, .secondary { height: 44px; border: none; border-radius: 10px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #334; }
</style>
