<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>用户登陆</p>
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
						<input type="text" v-model="userName" placeholder="请输入用户名">
					</div>
					
					<div class="input-group">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="#8faca5" stroke-width="1.5"/>
								<path d="M5.83333 9.16667V5.83333C5.83333 4.72827 6.27232 3.66847 7.05372 2.88706C7.83513 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66847 14.1667 4.72827 14.1667 5.83333V9.16667" stroke="#8faca5" stroke-width="1.5" stroke-linecap="round"/>
							</svg>
						</div>
						<input type="password" v-model="password" placeholder="请输入密码">
					</div>
				</div>

				<div class="button-login">
					<button @click="login" class="login-btn">
						<span>用户登陆</span>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4.16675 10H15.8334" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M10.8334 5L15.8334 10L10.8334 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>

				<div class="button-group">
					<button @click="register" class="secondary-btn">用户注册</button>
					<button @click="toSeller" class="secondary-btn">商家登录</button>
					<button @click="toAdmin" class="secondary-btn">管理员登录</button>
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
		name: 'userLogin',
		data() {
			return {
				userName: '',
				password: '',
				user: {
					userId: "用户id",
					password: "password",
					userName: "用户名",
				},
			}
		},
		methods: {
			async login() {
				if (this.userName === '') {
					alert('用户名不能为空！');
					return;
				}
				if (this.password === '') {
					alert('密码不能为空！');
					return;
				}

				try {
					// 1. 等待认证请求完成
					const authResponse = await this.$axios.post('/api/auth', {
						username: this.userName,
						password: this.password,
						rememberMe: false
					});

					const token = authResponse.data.id_token || authResponse.data.token;
					if (!token) {
						alert('登录失败：未返回token');
						return;
					}
					sessionStorage.setItem('token', token); // 存储token

					// 2. 认证成功后，再等待获取用户信息的请求
					const userResponse = await this.$axios.get('/api/user');
					console.log('完整的响应对象:', userResponse);

					// 修复点：直接使用 userResponse.data 作为用户数据
					const userData = userResponse.data;

					// 修复点：判断用户数据是否存在即可，无需判断不存在的 code 字段
					if (userData) {
						// 避免存储密码！
						const user = {
							userId: userData.id,
							userName: userData.username,
							// password: userData.password, // 切勿存储密码
						};
						this.$setSessionStorage('user', user); // 存储用户信息（不含密码）
						this.$router.push({
							path: '/user'
						}); // 跳转页面
						console.log('获取用户成功:', user);
					} else {
						// 虽然HTTP状态码是200，但返回的userData可能为null或undefined
						console.log('查询的用户不存在');
						this.$message.info('用户不存在');
					}
					// 完全移除原有的 else 分支（判断 res.code 的那个）
				} catch (error) {
					console.error('登录失败:', error);

					// 以下错误处理保持不变，它是良好的实践
					if (error.response?.status === 403) {
						alert('用户名或密码错误！');
					} else if (error.response?.status >= 500) {
						alert('服务器开小差了，请稍后再试！');
					} else if (error.request) {
						alert('网络异常或无法连接服务器，请检查您的网络连接！');
					} else {
						alert('登录过程中发生未知错误，请稍后再试！');
					}
				}
			},
			register() {
				this.$router.push({
					path: '/register'
				});
			},
			toSeller(){
				this.$router.push({
					path: '/sellerLogin'
				});
			},
			toAdmin(){
				this.$router.push({
					path: '/adminLogin'
				});
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
		max-width: 420px;
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

	/****************** 按钮样式 ******************/
	.button-login {
		margin-bottom: 20px;
	}

	.login-btn {
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

	.login-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(143, 172, 165, 0.4);
	}

	.login-btn:active {
		transform: translateY(0);
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.secondary-btn {
		width: 100%;
		height: 44px;
		background: #f8f9fa;
		color: #5a6c7d;
		border: 1.5px solid #e1e8ed;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.secondary-btn:hover {
		background: #edf2f7;
		border-color: #8faca5;
		color: #8faca5;
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
	}

	@media (max-width: 480px) {
		.form-container {
			padding: 25px 15px;
		}
		
		.input-group input {
			height: 48px;
			font-size: 15px;
		}
		
		.login-btn {
			height: 48px;
			font-size: 15px;
		}
		
		.secondary-btn {
			height: 42px;
			font-size: 13px;
		}
	}
</style>