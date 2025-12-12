<template>
	<div class="user-page">
		<!-- 头部：保持统一风格 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<h1 class="header-title">个人资料</h1>
			<div class="header-right"></div>
		</header>

		<!-- 主体卡片 -->
		<div class="card-container">
			<div class="card">
				<!-- 用户名字段 -->
				<div class="form-field">
					<label class="field-label">用户名</label>
					<span class="field-value">{{ user.userName || '未设置' }}</span>
				</div>

				<!-- 密码字段 -->
				<div class="form-field">
					<label class="field-label">密码</label>
					<div class="password-wrapper">
						<input :type="showPassword ? 'text' : 'password'" v-model="user.password" class="field-input"
							:disabled="!isEditable" placeholder="请输入新密码" />
						<button class="toggle-btn" @click="togglePassword" v-if="isEditable">
							{{ showPassword ? '隐藏' : '显示' }}
						</button>
					</div>
				</div>

				<!-- 头像字段 -->
				<div class="form-field avatar-field">
					<label class="field-label">头像</label>
					<div class="avatar-wrapper">
						<img :src="user.userImg || defaultAvatar" alt="用户头像" class="avatar-img" />
					</div>
				</div>

				<!-- 按钮区：核心优化——4个按钮均匀分布 -->
				<div class="btn-group">
					<!-- 编辑态：单按钮居中 -->
					<template v-if="isEditable">
						<button class="btn primary-btn" @click="save">保存修改</button>
					</template>
					<template v-else>
						<button class="btn ghost-btn" @click="enableEditing">
							<i class="fa fa-pencil icon"></i>
							<span class="text">修改</span>
						</button>

						<button class="btn ghost-btn" @click="goToFavourite">
							<i class="fa fa-star icon"></i>
							<span class="text">我的收藏</span>
						</button>

						<button class="btn ghost-btn" @click="goToAddress">
							<i class="fa fa-map-marker icon"></i>
							<span class="text">我的地址</span>
						</button>

						<button class="btn ghost-btn" @click="goToWallet">
							<i class="fa fa-credit-card icon"></i>
							<span class="text">我的钱包</span>
						</button>

						<button class="btn ghost-btn" @click="logout">
							<i class="fa fa-sign-out icon"></i>
							<span class="text">退出登录</span>
						</button>
					</template>
				</div>
			</div>
		</div>

		<NavFooter />
	</div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue';
import defaultAvatar from '@/assets/userImg/yhtx07.png';

export default {
	name: 'UserPage',
	components: {
		NavFooter
	},
	data() {
		return {
			user: this.$getSessionStorage('user') || { password: '未成功获得密码' },
			showPassword: false,
			isEditable: false,
			defaultAvatar
		};
	},
	methods: {
		togglePassword() {
			this.showPassword = !this.showPassword;
		},
		enableEditing() {
			this.isEditable = true;
		},
		logout() {
			this.$removeSessionStorage('user');
			this.$router.push('/login');
		},
		save() {
			this.$axios.post('/api/password', {
				password: this.user.password,
				username: this.user.userName,
				rememberMe: false
			})
				.then(response => {
					if (response.status === 200) {
						const user = { userId: this.user.userId, userName: this.user.userName };
						this.$setSessionStorage('user', user);
						alert(response.data || '密码修改成功！');
						this.isEditable = false;
					} else {
						alert('保存失败：' + (response.data || '服务器异常'));
					}
				})
				.catch(error => {
					console.error('请求失败:', error);
					alert('请求失败，请检查网络或重试');
				});
		},
		goToWallet() {
			this.$axios.post('/api/wallet');
			this.$router.push({ name: 'WalletPage' });
		},
		goToAddress() {
			this.$router.push({ name: 'UserAddress' });
		},
		goToFavourite() {
			this.$router.push({ path: '/favouriteBusinesses' });
		}
	}
};
</script>

<style scoped>
/* 全局容器 */
.user-page {
	width: 100%;
	min-height: 100vh;
	background-color: #fcfcfa;
	padding-bottom: 90px;
	box-sizing: border-box;
	font-family: 'Segoe UI', 'Inter', sans-serif;
}

/* 头部 */
.header {
	width: 100%;
	height: 80px;
	background-color: #ffffff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	padding: 0 36px;
	box-sizing: border-box;
}

.back-box {
	width: 50px;
	height: 50px;
	border-radius: 10px;
	background-color: #f5f5f2;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}

.back-box:hover {
	background-color: #ebebe6;
}

.back-symbol {
	font-size: 26px;
	color: #5d5a56;
	font-weight: 600;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 24px;
	font-weight: 600;
	color: #33312e;
	margin: 0;
}

.header-right {
	width: 50px;
}

/* 卡片容器 */
.card-container {
	width: 100%;
	max-width: 880px;
	margin: 100px auto 40px;
	padding: 0 36px;
	box-sizing: border-box;
}

/* 主体卡片 */
.card {
	width: 100%;
	background-color: #ffffff;
	border-radius: 14px;
	box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
	padding: 40px;
	box-sizing: border-box;
}

/* 表单项 */
.form-field {
	display: grid;
	grid-template-columns: 180px 1fr;
	align-items: center;
	gap: 16px;
	margin-bottom: 32px;
}

.field-label {
	font-size: 18px;
	color: #33312e;
	font-weight: 500;
	text-align: right;
	padding-right: 8px;
}

.field-value {
	font-size: 17px;
	color: #33312e;
	line-height: 1.5;
}

/* 输入框 */
.field-input {
	width: 100%;
	height: 56px;
	padding: 0 20px;
	border: 1px solid #e0dedb;
	border-radius: 10px;
	font-size: 17px;
	color: #33312e;
	transition: all 0.2s;
	box-sizing: border-box;
	background-color: #fafbfc;
}

.field-input:focus {
	outline: none;
	border-color: #8faca5;
	box-shadow: 0 0 0 4px rgba(143, 172, 165, 0.15);
	background-color: #ffffff;
}

.field-input::placeholder {
	color: #a09c97;
	font-size: 16px;
}

/* 密码容器 */
.password-wrapper {
	display: flex;
	align-items: center;
	gap: 12px;
}

.toggle-btn {
	background: transparent;
	border: none;
	color: #8faca5;
	font-size: 16px;
	cursor: pointer;
	padding: 8px 12px;
	border-radius: 6px;
	transition: all 0.2s;
}

.toggle-btn:hover {
	background-color: #f8f5ea;
}

/* 头像字段 */
.avatar-field {
	align-items: flex-start;
	padding-top: 8px;
}

.avatar-wrapper {
	display: flex;
	align-items: center;
}

.avatar-img {
	width: 128px;
	height: 128px;
	border-radius: 50%;
	border: 2px solid #f0efe9;
	object-fit: cover;
	transition: all 0.3s;
	cursor: pointer;
}

.avatar-img:hover {
	border-color: #8faca5;
	transform: scale(1.03);
	box-shadow: 0 4px 12px rgba(143, 172, 165, 0.1);
}

/* 按钮组：核心优化——4个按钮均匀分布 */
.btn-group {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	margin-top: 32px;
	width: 100%;
	flex-wrap: wrap;
}

/* 按钮通用样式：统一尺寸+图标文字组合 */
.btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	height: 60px;
	padding: 0 16px;
	border-radius: 12px;
	font-size: 18px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.25s ease;
	border: 1px solid transparent;
	flex: 1;
	min-width: 120px;
	max-width: 220px;
}

/* 主按钮（保存修改）：绿色主调+阴影 */
.primary-btn {
	background-color: #8faca5;
	color: #ffffff;
	border-color: #8faca5;
	flex: none;
	padding: 0 32px;
}

.primary-btn:hover {
	background-color: #789a94;
	border-color: #789a94;
	box-shadow: 0 6px 20px rgba(143, 172, 165, 0.25);
	transform: translateY(-2px);
}

/* 幽灵按钮（4个功能按钮）：浅灰底+主色边框hover */
.ghost-btn {
	background-color: #f9f9f7;
	color: #33312e;
	border-color: #f0efe9;
}

.ghost-btn:hover {
	background-color: #f8f5ea;
	color: #8faca5;
	border-color: #8faca5;
	transform: translateY(-2px);
	box-shadow: 0 4px 16px rgba(143, 172, 165, 0.1);
}

/* 按钮图标：统一大小 */
.icon {
	font-size: 18px;
}

/* 响应式适配：不同屏幕下保持均匀 */
/* 大屏（≥1024px）：4个按钮横向均匀分布 */
@media (min-width: 1024px) {
	.btn-group {
		gap: 16px;
	}
}

/* 中屏（768px-1023px）：2个按钮一行，均匀分布 */
@media (max-width: 1023px) {
	.btn {
		flex: 1;
		max-width: none;
		margin-bottom: 8px;
	}

	.btn-group {
		justify-content: space-between;
		gap: 12px;
	}
}

/* 小屏（≤767px）：按钮纵向排列，占满宽度 */
@media (max-width: 767px) {
	.header {
		height: 70px;
		padding: 0 24px;
	}

	.back-box {
		width: 44px;
		height: 44px;
	}

	.back-symbol {
		font-size: 22px;
	}

	.header-title {
		font-size: 22px;
	}

	.card-container {
		margin: 90px auto 30px;
		padding: 0 24px;
	}

	.card {
		padding: 32px 20px;
	}

	.form-field {
		grid-template-columns: 1fr;
		gap: 8px;
		margin-bottom: 28px;
	}

	.field-label {
		text-align: left;
		padding-right: 0;
		font-size: 17px;
	}

	.field-input {
		height: 52px;
		font-size: 16px;
	}

	.avatar-img {
		width: 100px;
		height: 100px;
	}

	.btn-group {
		flex-direction: column;
		justify-content: stretch;
		gap: 10px;
		margin-top: 24px;
	}

	.btn {
		width: 100%;
		flex: none;
		height: 56px;
		margin-bottom: 0;
	}

	.primary-btn {
		width: 100%;
		padding: 0 24px;
	}
}
</style>
