<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>管理员登陆</p>
		</header>

		<!-- 主要内容区域 -->
		<main class="main-content">
			<!-- 表单部分 -->
			<div class="form-container">
				<div class="form-box">
					<div class="input-group">
						<div class="input-icon">
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M16.6667 17.5V15.8333C16.6667 13.9924 15.1743 12.5 13.3333 12.5H6.66667C4.82573 12.5 3.33333 13.9924 3.33333 15.8333V17.5" stroke="#8faca5" stroke-width="1.5" stroke-linecap="round"/>
								<path d="M10 9.16667C12.3012 9.16667 14.1667 7.30119 14.1667 5C14.1667 2.69881 12.3012 0.833328 10 0.833328C7.69881 0.833328 5.83333 2.69881 5.83333 5C5.83333 7.30119 7.69881 9.16667 10 9.16667Z" stroke="#8faca5" stroke-width="1.5"/>
							</svg>
						</div>
						<input type="text" v-model="sellerId" placeholder="请输入管理员ID">
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
						<span>管理员登陆</span>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4.16675 10H15.8334" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M10.8334 5L15.8334 10L10.8334 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>

				<div class="button-group">
					<button @click="toUser" class="secondary-btn">返回</button>
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
		name: 'sellerLogin',
		data() {
			return {
				sellerId: '',
				password: '',
				seller:{
					sellerId:"777",
					businessId: 777,
					password:"777",
					businessName:"777",
					
					
					

				},
			}
		},
		methods: {
            login() {
                    if (this.sellerId === '') {
                        alert('管理员ID不能为空！');
                        return;
                    }
                    if (this.password === '') {
                        alert('密码不能为空！');
                        return;
                    }

                    this.$axios.post('/api/auth', {
                        username: this.sellerId,   // LoginDto.username
                        password: this.password,   // LoginDto.password
                        rememberMe: false          // LoginDto.rememberMe (布尔值)
                        }).then(response => {
                        const token = response.data.id_token || response.data.token;
                        if (!token) {
                            alert('登录失败：未返回token');
                            return;
                        }

                        sessionStorage.setItem('token', token);

                        const admin = { adminId: this.sellerId };
                        this.$setSessionStorage('admin', admin);

                        this.$router.push({ path: '/adminPage' });
                        }).catch(error => {
                        console.error(error);
                        alert('管理员名或密码错误！');
                        });

                    },

			register() {
				this.$router.push({
					path: '/sellerRegister'
				});
			},
			toUser() {
				this.$router.push({
					path: '/login'
				});
			},
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