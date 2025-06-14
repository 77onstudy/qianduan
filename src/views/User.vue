<template>
    <div class="user-page">
      <h2>个人资料</h2>
  
      <div class="user-info">
        <div><strong>用户ID：</strong> {{ user.userId }}</div>
  
        <div>
          <strong>用户名：</strong>
          <input v-model="user.userName" />
        </div>
  
        <div>
          <strong>密码：</strong>
          <input :type="showPassword ? 'text' : 'password'" v-model="user.password" />
          <button @click="togglePassword">{{ showPassword ? '隐藏' : '显示' }}</button>
        </div>
  
        <div>
          <strong>性别：</strong> {{ user.userSex === 1 ? '男' : '女' }}
        </div>
  
        <div class="avatar">
          <strong>头像：</strong>
          <img :src="user.userImg || defaultAvatar" alt="头像" />
        </div>
      </div>
  
      <div class="actions">
        <button @click="save">保存修改</button>
        <button @click="logout">退出登录</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserPage',
    data() {
      return {
        user: {
          userId: '777',
          password: '777',
          userName: '777',
          userSex: 1,
          userImg: '' // 可以填一张默认头像链接
        },
        showPassword: false,
        defaultAvatar: 'https://via.placeholder.com/80' // 可换成你本地默认头像路径
      }
    },
    methods: {
      togglePassword() {
        this.showPassword = !this.showPassword
      },
      save() {
        alert(`已保存：用户名=${this.user.userName}，密码=${this.user.password}`)
        // TODO: 调用接口保存修改（或存 localStorage）
      },
      logout() {
        // 清除用户状态，可扩展为清空 Vuex 或 localStorage
        this.$router.push('/login')
      }
    }
  }
  </script>
  
  <style scoped>
  .user-page {
    padding: 20px;
  }
  .user-info div {
    margin-bottom: 10px;
  }
  .user-info input {
    padding: 4px 8px;
  }
  .avatar img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-top: 5px;
  }
  .actions {
    margin-top: 20px;
  }
  .actions button {
    margin-right: 10px;
    padding: 6px 12px;
  }
  </style>
  