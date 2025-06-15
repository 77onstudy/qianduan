<template>
  <div class="user-page">
    <h2>👤 个人资料</h2>
    <div class="card">
      <!-- 用户ID字段 -->
      <div class="field">
        <label>用户ID：</label>
        <span>{{ user.userId }}</span>
      </div>

      <!-- 用户名字段 -->
      <div class="field">
        <label>用户名：</label>
        <input v-model="user.userName" class="input" :disabled="!isEditable" />
      </div>

      <!-- 密码字段 -->
      <div class="field">
        <label>密码：</label>
        <div class="password-box">
          <input :type="showPassword ? 'text' : 'password'" v-model="user.password" class="input" :disabled="!isEditable" />
          <template v-if="isEditable">
            <button class="text-btn" @click="togglePassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </template>
        </div>
      </div>

      <!-- 性别字段 -->
    <div class="field">
      <label>性别：</label>
      <div class="gender-options">
        <label><input type="radio" v-model="user.userSex" :value="1" :disabled="!isEditable" /> 男</label>
        <label><input type="radio" v-model="user.userSex" :value="0" :disabled="!isEditable" /> 女</label>
      </div>
    </div>

      <!-- 默认头像展示 -->
      <div class="field avatar">
        <label>头像：</label>
        <img :src="user.userImg || defaultAvatar" alt="头像" />
      </div>

      <!-- 按钮区 -->
      <div class="btns" :class="{ dual: !isEditable }">
        <template v-if="isEditable">
          <button class="primary" @click="save">保存修改</button>
        </template>
        <template v-else>
          <button class="ghost" @click="enableEditing">修改</button>
          <button class="ghost" @click="logout">退出登录</button>
        </template>
      </div>
    </div>
    <NavFooter />
  </div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue';
import defaultAvatar from '@/assets/userImg/yhtx07.png';
import axios from 'axios';


export default {
  name: 'UserPage',
  components: { NavFooter },
  data() {
  return {
    defaultAvatar,
    user: this.$getSessionStorage('user') || {
      userId: '',
      password: '',
      userName: '',
      userSex: 1,
      userImg: ''
    },
    showPassword: false,
    isEditable: false
  };
},
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    enableEditing() {
      this.isEditable = true;
    },
    save() {
      const payload = {
        userId: this.user.userId,
        userName: this.user.userName,
        password: this.user.password,
        userSex: this.user.userSex,
        userImg: this.user.userImg || this.defaultAvatar
      };
      axios.post('/UserController/updateUser', null, {
        params: payload
      })
      .then(response => {
        if (response.data.code === 200) {
          this.user = response.data.data;
          alert('保存成功！');
          this.isEditable = false;
        } else {
          alert('保存失败：' + response.data.msg);
        }
      })
      .catch(error => {
        console.error('请求失败:', error);
        alert('请求失败');
      });
    }
  }
};
</script>

<style scoped>
.user-page {
  padding: 5vw;
  font-family: 'Segoe UI', sans-serif;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
}

h2 {
  text-align: center;
  margin-bottom: 5vw;
  font-size: 5vw;
}

.card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 5vw;
  border-radius: 2vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  background: #fff;
}

.field {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: nowrap;
  min-height: 3em;
}

.field label {
  white-space: nowrap;
  width: 80px;
  min-width: 60px;
  font-size: 4vw;
  flex-shrink: 0;
  margin-top: 0.5em;
}

.field span {
  flex: 1;
  font-size: 4vw;
}

.gender-options {
  display: flex;
  flex-wrap: wrap;
  gap: 2vw;
  font-size: 1rem; /* 可调成 3.5vw 让它响应式 */
}
.gender-options input[type="radio"] {
  transform: scale(1.2); /* 放大圆圈 */
}

.input {
  flex: 1;
  min-width: 0;
  padding: 1em;
  font-size: 4vw;
  border: 1px solid #ccc;
  border-radius: 0.6em;
  box-sizing: border-box;
  width: 100%;
}

.password-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.text-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 4vw;
  white-space: nowrap;
}

.avatar img {
  width: 20vw;
  max-width: 100px;
  height: auto;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid #eee;
  object-fit: cover;
  max-width: 30vw;     /* 避免超出边框 */
  min-width: 60px;
  max-width: 100%;
}

.btns {
  display: flex;
  justify-content: center;
  gap: 5vw;
  margin-top: 4vw;
  flex-wrap: wrap;
}

.btns.dual {
  justify-content: space-between;
}

.primary,
.ghost {
  font-size: 4vw;
  padding: 2vw 4vw;
  min-width: 30vw;
  text-align: center;
  border: none;
  border-radius: 1vw;
  cursor: pointer;
  box-sizing: border-box;
}

.primary {
  background-color: #007bff;
  color: white;
}

.ghost {
  background-color: #f5f5f5;
  color: #333;
}

.primary:hover {
  background-color: #0056b3;
}

.ghost:hover {
  background-color: #e0e0e0;
}
</style>