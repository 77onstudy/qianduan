<template>
	<div class="user-page">
		<h2>👤 个人资料</h2>
		<div class="card">
			<!-- 用户名字段 -->
			<div class="field">
				<label>用户名：</label>
				<span>{{ user.userName }}</span>
			</div>

			<!-- 密码字段 -->
			<div class="field">
				<label>密码：</label>
				<div class="password-box">
					<input :type="showPassword ? 'text' : 'password'" v-model="user.password" class="input"
						:disabled="!isEditable" />
					<template v-if="isEditable">
						<button class="text-btn" @click="togglePassword">
							{{ showPassword ? '隐藏' : '显示' }}
						</button>
					</template>
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
					<button class="ghost" @click="goToAddress">我的地址</button>
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
	//import axios from 'axios';


	export default {
		name: 'UserPage',
		components: {
			NavFooter
		},
		data() {
			return {
				defaultAvatar,
				user: this.$getSessionStorage('user') || {
					password: '未成功获得密码',
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
			logout() {
				this.$removeSessionStorage('user');
				this.$router.push('/login');
			},
			save() {
				

				this.$axios.post('/api/password', {
						password: this.user.password,
						username: this.user.userName,
						rememberMe: false,
					})
					.then(response => {
						console.log(response);
						if (response.status === 200) {
							const user = {
								userId: this.user.userId,
								userName: this.user.userName,
							};
							this.$setSessionStorage('user', user);
							alert(response.data);
							this.isEditable = false;
						} else {
							alert('保存失败：' + response.data);
						}
					})
					.catch(error => {
						console.error('请求失败:', error);
						alert('请求失败');
					});
			},
			goToAddress() {
				this.$router.push({
					name: 'UserAddress'
				})
			}
		}
	};
</script>

<style scoped>
.user-page {
	padding: 5vw 4vw;
	font-family: 'Segoe UI', sans-serif;
	box-sizing: border-box;
	width: 100%;
	min-height: 100vh;
}

/* 标题：移动端适中，桌面端自动变大 */
h2 {
	text-align: center;
	margin-bottom: clamp(16px, 5vw, 40px);
	font-size: clamp(20px, 5vw, 32px);
}

/* 卡片容器：移动端铺满，桌面端缩到合理宽度 */
.card {
	width: 100%;
	max-width: 600px;
	margin: 0 auto;
	padding: clamp(16px, 5vw, 32px);
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	background: #fff;
}

/* 字段行：移动端纵向压缩，桌面端会切换为两列网格（见下方媒体查询） */
.field {
	display: flex;
	align-items: center;
	margin-bottom: 16px;
	flex-wrap: nowrap;
	min-height: 3em;
	gap: 12px;
}

/* 标签：移动端窄，桌面端会用固定列宽 */
.field label {
	white-space: nowrap;
	width: auto;
	min-width: 60px;
	font-size: clamp(14px, 4vw, 16px);
	flex-shrink: 0;
	margin-top: 0.25em;
	color: #333;
}

/* 只读文本的展示 */
.field span {
	flex: 1;
	font-size: clamp(14px, 4vw, 16px);
	color: #111;
}

/* 输入组件（如密码） */
.input {
	flex: 1;
	min-width: 0;
	padding: 0.8em 0.9em;
	font-size: clamp(14px, 4vw, 16px);
	border: 1px solid #dcdcdc;
	border-radius: 10px;
	box-sizing: border-box;
	width: 100%;
}

/* 密码操作区：按钮在右侧行内展示 */
.password-box {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: 1;
}

.text-btn {
	background: none;
	border: none;
	color: #0a58ff;
	cursor: pointer;
	font-size: clamp(14px, 4vw, 16px);
	white-space: nowrap;
	padding: 4px 6px;
	border-radius: 6px;
}
.text-btn:hover {
	text-decoration: underline;
}

/* 头像：移动端相对小，桌面端用固定大尺寸（见媒体查询） */
.avatar img {
	width: clamp(60px, 20vw, 100px);
	height: clamp(60px, 20vw, 100px);
	border-radius: 50%;
	border: 1px solid #eee;
	object-fit: cover;
}

/* 按钮区：移动端居中换行，桌面端右对齐 */
.btns {
	display: flex;
	justify-content: center;
	gap: 12px;
	margin-top: 16px;
	flex-wrap: wrap;
}
.btns.dual {
	justify-content: space-between;
}

/* 小屏“列”布局 */
@media (max-width: 480px) {
	.btns {
		flex-direction: column;
		align-items: stretch;
	}
}

/* 通用按钮样式（移动端优先） */
.primary,
.ghost {
	font-size: clamp(14px, 4vw, 16px);
	padding: 10px 16px;
	min-width: 140px;
	text-align: center;
	border: none;
	border-radius: 10px;
	cursor: pointer;
	box-sizing: border-box;
}
.primary {
	background-color: #0a58ff;
	color: #fff;
}
.ghost {
	background-color: #f5f5f5;
	color: #333;
}
.primary:hover { background-color: #0849d4; }
.ghost:hover { background-color: #e9e9e9; }

/* ===== 平板 / 小桌面（>=768px）开始桌面化适配 ===== */
@media (min-width: 768px) {

	.user-page {
		padding: 48px 24px;
	}

	h2 {
		margin-bottom: 32px;
	}

	.card {
		max-width: 760px;
		padding: 28px 32px;
		border-radius: 14px;
	}

	/* 字段区域改为两列网格：左 140px label + 右自适应内容 */
	.field {
		display: grid;
		grid-template-columns: 140px 1fr;
		align-items: center;
		gap: 12px 16px;
		min-height: unset;
	}

	.field label {
		width: 100%;
		min-width: 140px;
		margin-top: 0;
		text-align: right;
		padding-right: 4px;
		color: #222;
	}

	/* 头像在桌面端固定更大，避免随容器变化 */
	.avatar img {
		width: 112px;
		height: 112px;
	}

	/* 按钮区靠右；非编辑态三个操作按钮一行排开 */
	.btns {
		justify-content: flex-end;
		gap: 12px;
		margin-top: 20px;
	}

	/* 更像桌面按钮 */
	.primary,
	.ghost {
		min-width: 120px;
		padding: 10px 18px;
		border-radius: 10px;
	}
}

/* ===== 大桌面（>=1200px）进一步优化密度与宽度 ===== */
@media (min-width: 1200px) {

	.card {
		max-width: 880px;
		padding: 32px 40px;
	}

	.field {
		grid-template-columns: 180px 1fr;
		gap: 14px 20px;
	}

	.field label {
		min-width: 180px;
		font-size: 16px;
	}

	.field span,
	.input,
	.text-btn {
		font-size: 16px;
	}

	.avatar img {
		width: 128px;
		height: 128px;
	}

	.primary,
	.ghost {
		min-width: 132px;
		padding: 12px 20px;
		font-size: 16px;
		border-radius: 12px;
	}
}

</style>