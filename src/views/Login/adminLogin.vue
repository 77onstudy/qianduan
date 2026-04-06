<template>
  <div class="page">
    <header class="header">管理员登录</header>
    <main class="main">
      <section class="card">
        <input v-model.trim="username" class="input" placeholder="请输入管理员用户名" />
        <input v-model="password" class="input" type="password" placeholder="请输入密码" />
        <button class="primary" @click="login">登录</button>
        <button class="secondary" @click="$router.push('/login')">返回用户登录</button>
      </section>
    </main>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue'

export default {
  name: 'AdminLogin',
  components: { NavFooter },
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    normalizeAuthorities(authorities) {
      if (!Array.isArray(authorities)) return []
      return authorities
        .map(item => {
          if (typeof item === 'string') return item
          return item?.name || ''
        })
        .filter(Boolean)
    },
    async login() {
      if (!this.username || !this.password) {
        alert('请输入用户名和密码')
        return
      }

      try {
        const authResponse = await this.$axios.post('/api/auth', {
          username: this.username,
          password: this.password,
          rememberMe: false
        })
        const token = authResponse?.data?.data?.id_token
        if (!token) {
          alert('登录失败，未获取到 token')
          return
        }

        sessionStorage.setItem('token', token)

        const userResponse = await this.$axios.get('/api/user')
        const userData = userResponse?.data?.data
        if (!userData?.id) {
          sessionStorage.removeItem('token')
          alert('登录成功，但未获取到管理员信息')
          return
        }

        const authorities = this.normalizeAuthorities(userData.authorities)
        if (!authorities.includes('ADMIN')) {
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('admin')
          alert('该账号不是管理员账号，请使用正确的管理员账号登录')
          return
        }

        this.$setSessionStorage('admin', {
          adminId: userData.id,
          adminName: userData.username || this.username,
          authorities
        })
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('seller')
        this.$router.push('/adminPage')
      } catch (error) {
        console.error(error)
        alert(error?.response?.data?.message || '登录失败')
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
