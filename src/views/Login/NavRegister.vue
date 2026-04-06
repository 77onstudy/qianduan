<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>用户注册</p>
		</header>

		<!-- 主要内容区域 -->
		<main class="main-content">
			<!-- 表单部分 -->
			<div class="form-container">
				<div class="form-box">
					<div class="input-group">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 10C11.841 10 13.3333 8.5076 13.3333 6.66667C13.3333 4.82573 11.841 3.33333 10 3.33333C8.15907 3.33333 6.66667 4.82573 6.66667 6.66667C6.66667 8.5076 8.15907 10 10 10Z" stroke="#8faca5" stroke-width="1.5"/>
								<path d="M16.6667 17.5V15.8333C16.6667 14.2825 15.2175 12.5 13.3333 12.5H6.66667C4.7825 12.5 3.33333 14.2825 3.33333 15.8333V17.5" stroke="#8faca5" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						</div>
						<input type="text" v-model="user.userName" placeholder="请输入用户名称">
					</div>
					
					<div class="input-group">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="#8faca5" stroke-width="1.5"/>
								<path d="M5.83333 9.16667V5.83333C5.83333 4.72827 6.27232 3.66847 7.05372 2.88706C7.83513 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66847 14.1667 4.72827 14.1667 5.83333V9.16667" stroke="#8faca5" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						</div>
						<input type="password" v-model="user.password" placeholder="请输入密码">
					</div>
					
					<div class="input-group">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="#8faca5" stroke-width="1.5"/>
								<path d="M5.83333 9.16667V5.83333C5.83333 4.72827 6.27232 3.66847 7.05372 2.88706C7.83513 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66847 14.1667 4.72827 14.1667 5.83333V9.16667" stroke="#8faca5" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						</div>
						<input type="password" v-model="confirmPassword" placeholder="请再次输入密码">
					</div>
					
					<div class="input-group">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M14.9999 16.6667H4.99992C3.15898 16.6667 1.66675 15.1743 1.66675 13.3333V6.66667C1.66675 4.82573 3.15898 3.33333 4.99992 3.33333H14.9999C16.8409 3.33333 18.3333 4.82573 18.3333 6.66667V13.3333C18.3333 15.1743 16.8409 16.6667 14.9999 16.6667Z" stroke="#8faca5" stroke-width="1.5"/>
								<path d="M1.66675 7.5H18.3334" stroke="#8faca5" stroke-width="1.5" stroke-linecap="round"/>
								<path d="M5 10H7.5" stroke="#8faca5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<input type="text" @blur="checkUserId" v-model="user.userId" placeholder="请输入手机号码">
					</div>
					
					<div class="input-group gender-group">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 18.3333C14.6024 18.3333 18.3334 14.6024 18.3334 10C18.3334 5.39763 14.6024 1.66667 10 1.66667C5.39767 1.66667 1.66669 5.39763 1.66669 10C1.66669 14.6024 5.39767 18.3333 10 18.3333Z" stroke="#8faca5" stroke-width="1.5"/>
								<path d="M10 13.3333C11.841 13.3333 13.3334 11.841 13.3334 10C13.3334 8.15907 11.841 6.66667 10 6.66667C8.15909 6.66667 6.66669 8.15907 6.66669 10C6.66669 11.841 8.15909 13.3333 10 13.3333Z" stroke="#8faca5" stroke-width="1.5"/>
							</svg>
						</div>
						<div class="gender-options">
							<label class="gender-option">
								<input type="radio" v-model="user.userSex" value="1">
								<span class="radio-custom"></span>
								<span class="gender-text">男</span>
							</label>
							<label class="gender-option">
								<input type="radio" v-model="user.userSex" value="0">
								<span class="radio-custom"></span>
								<span class="gender-text">女</span>
							</label>
						</div>
					</div>
				</div>

				<div class="button-register">
					<button @click="register" class="register-btn">
						<span>注册</span>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16.6667 5.83333L7.50008 15L3.33341 10.8333" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>
			</div>
			
			<!-- 装饰元素 -->
			<div class="decoration">
				<div class="circle circle-1"></div>
				<div class="circle circle-2"></div>
				<div class="circle circle-3"></div>
			</div>
		</main>

		<!-- 底部菜单部分 -->
		<NavFooter></NavFooter>
	</div>
</template>

<script>
	import NavFooter from '@/components/NavFooter.vue';

	export default {
		name: 'NavRegister',
		data() {
			return {
				user: {
					userId: '',
					password: '',
					userName: '',
					userSex: 1
				},
				confirmPassword: ''
			}
		},
		methods: {
			// checkUserId() {
			// 	this.$axios.post('UserController/getUserById', this.$qs.stringify({
			// 		userId: this.user.userId,
			// 	})).then(response => {
			// 		if (response.data == 1) {
			// 			this.user.userId = '';
			// 			alert('此手机号码已存在！')
			// 		}
			// 	}).catch(error => {
			// 		console.error(error);
			// 	});
			// },
			async register() {
				if (this.user.userId == '') {
					alert('手机号码不能为空！');
					return;
				}
				if (this.user.password == '') {
					alert('密码不能为空！');
					return;
				}
				if (this.user.password != this.confirmPassword) {
					alert('两次输入的密码不一致！');
					return;
				}
				if (this.user.userName == '') {
					alert('用户名不能为空！');
					return;
				}

				try {
					const body = {
					id: Number(this.user.userId),
					username: this.user.userName,
					deleted: false,
					authorities: [{ name: 'USER' }],
					password: this.user.password
					};

					const resp = await this.$axios.post('/api/addUser', body, {
					headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
					});

					// —— 统一解析：尽可能从不同形态里取出"有效数据"和"消息" ——
					const status = resp?.status ?? 0;
					const raw = resp?.data;
					const wrappedOk = raw && (raw.success === true || raw.code === 'OK' || raw.code === 0);
					const payload = raw?.data ?? raw; // 兼容 {data:{...}} 或 直接 {...}
					const hasEntityLike =
					payload && (payload.id != null || payload.username != null);

					// 判定成功的多重兜底：
					const ok = (status >= 200 && status < 300) && (wrappedOk || hasEntityLike || raw === '' || raw == null);

					if (ok) {
					// 可选：展示后端返回的用户名/ID
					const uname = payload?.username ?? this.user.userName;
					alert(`注册成功：${uname}`);
					this.$router.go(-1);
					return;
					}

					// 非 OK 的情况，尽力给出后端的错误信息
					const msg =
					raw?.message ||
					raw?.error ||
					(typeof raw === 'string' ? raw : '') ||
					`注册失败（状态码：${status}）`;
					alert(msg);
				} catch (error) {
					console.error(error);
					const msg =
					error?.response?.data?.message ||
					error?.response?.data?.error ||
					error?.message ||
					'注册失败';
					alert(msg);
				}
				}

		},
		components: {
			NavFooter
		}
	}
</script>

<style scoped>
	/****************** 总容器 ******************/
	.wrapper {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
		position: relative;
		overflow: hidden;
	}

	/****************** header部分 ******************/
	.wrapper header {
		width: 100%;
		height: 70px;
		background-color: #8faca5;
		color: #fff;
		font-size: 22px;
		font-weight: 600;
		position: sticky;
		left: 0;
		top: 0;
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 2px 10px rgba(143, 172, 165, 0.2);
	}

	/****************** 主要内容区域 ******************/
	.main-content {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20px;
		position: relative;
	}

	/****************** 表单容器 ******************/
	.form-container {
		width: 100%;
		max-width: 450px;
		background: #fff;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
		padding: 40px 30px;
		position: relative;
		z-index: 10;
	}

	/****************** 表单部分 ******************/
	.form-box {
		margin-bottom: 30px;
	}

	.input-group {
		position: relative;
		margin-bottom: 24px;
	}

	.input-icon {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
	}

	.input-group input {
		width: 100%;
		height: 52px;
		padding: 0 20px 0 50px;
		border: 1.5px solid #e1e8ed;
		border-radius: 12px;
		font-size: 16px;
		background: #fafbfc;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}

	.input-group input:focus {
		outline: none;
		border-color: #8faca5;
		background: #fff;
		box-shadow: 0 0 0 3px rgba(143, 172, 165, 0.1);
	}

	.input-group input::placeholder {
		color: #aab8c2;
	}

	/****************** 性别选择样式 ******************/
	.gender-group {
		display: flex;
		align-items: center;
	}

	.gender-options {
		display: flex;
		gap: 30px;
		margin-left: 50px;
	}

	.gender-option {
		display: flex;
		align-items: center;
		cursor: pointer;
		position: relative;
	}

	.gender-option input[type="radio"] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.radio-custom {
		width: 20px;
		height: 20px;
		border: 2px solid #e1e8ed;
		border-radius: 50%;
		display: inline-block;
		position: relative;
		margin-right: 10px;
		transition: all 0.3s ease;
	}

	.gender-option input[type="radio"]:checked + .radio-custom {
		border-color: #8faca5;
		background-color: #8faca5;
	}

	.gender-option input[type="radio"]:checked + .radio-custom::after {
		content: '';
		width: 8px;
		height: 8px;
		background: white;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.gender-text {
		font-size: 16px;
		color: #5a6c7d;
	}

	.gender-option:hover .radio-custom {
		border-color: #8faca5;
	}

	/****************** 按钮样式 ******************/
	.button-register {
		margin-bottom: 10px;
	}

	.register-btn {
		width: 100%;
		height: 52px;
		background: linear-gradient(135deg, #8faca5 0%, #7a9c94 100%);
		color: #fff;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(143, 172, 165, 0.3);
	}

	.register-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(143, 172, 165, 0.4);
	}

	.register-btn:active {
		transform: translateY(0);
	}

	/****************** 装饰元素 ******************/
	.decoration {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		pointer-events: none;
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(143, 172, 165, 0.05);
	}

	.circle-1 {
		width: 200px;
		height: 200px;
		top: 10%;
		right: 10%;
	}

	.circle-2 {
		width: 150px;
		height: 150px;
		bottom: 15%;
		left: 5%;
	}

	.circle-3 {
		width: 100px;
		height: 100px;
		bottom: 30%;
		right: 20%;
	}

	/****************** 响应式设计 ******************/
	@media (max-width: 768px) {
		.form-container {
			padding: 30px 20px;
			margin: 20px;
		}
		
		.wrapper header {
			height: 60px;
			font-size: 18px;
		}
		
		.main-content {
			padding: 10px;
		}
		
		.gender-options {
			gap: 20px;
			margin-left: 40px;
		}
	}

	@media (max-width: 480px) {
		.form-container {
			padding: 25px 15px;
		}
		
		.input-group input {
			height: 48px;
			font-size: 15px;
		}
		
		.register-btn {
			height: 48px;
			font-size: 15px;
		}
		
		.gender-options {
			flex-direction: column;
			gap: 15px;
			margin-left: 40px;
		}
	}
</style>