<template>
  <div class="page">
    <header class="header">用户注册</header>
    <main class="main">
      <section class="card">
        <input v-model.trim="username" class="input" placeholder="请输入用户名" />
        <input v-model="password" class="input" type="password" placeholder="请输入密码" />
        <input v-model="confirmPassword" class="input" type="password" placeholder="请再次输入密码" />
        <button class="primary" @click="register">立即注册</button>
        <button class="secondary" @click="$router.push('/login')">返回登录</button>
      </section>
    </main>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue'

export default {
  name: 'NavRegister',
  components: { NavFooter },
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    async register() {
      if (!this.username || !this.password) {
        alert('请填写用户名和密码')
        return
      }

      if (this.password !== this.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      try {
        await this.$axios.post('/api/addUser', {
          username: this.username,
          password: this.password
        })
        alert('注册成功，请登录')
        this.$router.push('/login')
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '注册失败')
      }
    }
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #8faca5; color: #fff; font-size: 22px; }
.main { display: flex; justify-content: center; padding: 40px 16px 100px; }
.card { width: 100%; max-width: 420px; background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); padding: 24px; display: grid; gap: 12px; }
.input { height: 46px; border: 1px solid #d9e0e6; border-radius: 10px; padding: 0 14px; font-size: 15px; }
.primary, .secondary { height: 44px; border: none; border-radius: 10px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #445; }
</style>
