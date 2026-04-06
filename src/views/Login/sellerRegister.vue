<template>
  <div class="page">
    <header class="header">商家注册</header>
    <main class="main">
      <section class="card">
        <p class="tip">
          当前商家账号仍由管理员创建，前端不再直接提交钱包、积分或其它历史注册流程。
        </p>
        <p class="tip">
          请先联系管理员创建商家账号，创建完成后使用商家登录入口进入系统。
        </p>
        <button class="primary" @click="$router.push('/sellerLogin')">前往商家登录</button>
        <button class="secondary" @click="$router.push('/login')">返回用户登录</button>
      </section>
    </main>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue'

export default {
  name: 'SellerRegister',
  components: { NavFooter }
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f7fa; }
.header { height: 64px; display: flex; align-items: center; justify-content: center; background: #8faca5; color: #fff; font-size: 22px; }
.main { display: flex; justify-content: center; padding: 40px 16px 100px; }
.card { width: 100%; max-width: 420px; background: #fff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,.08); padding: 24px; display: grid; gap: 12px; }
.tip { margin: 0; color: #55606f; line-height: 1.7; }
.primary, .secondary { height: 44px; border: none; border-radius: 10px; cursor: pointer; }
.primary { background: #8faca5; color: #fff; }
.secondary { background: #f3f5f7; color: #445; }
</style>
