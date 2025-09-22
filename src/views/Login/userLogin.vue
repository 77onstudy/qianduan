<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>用户登陆</p>
		</header>

		<!-- 表单部分 -->
		<div class="form-box">
			<li>
				<div class="title">
					用户名：
				</div>
				<div class="content">
					<input type="text" v-model="userName" placeholder="用户名">
				</div>
			</li>
			<li>
				<div class="title">
					密码：
				</div>
				<div class="content">
					<input type="password" v-model="password" placeholder="密码">
				</div>
			</li>
		</div>

		<div class="button-login">
			<button @click="login">用户登陆</button>
		</div>

		<div class="button-register">
			<button @click="register">用户注册</button>
		</div>
		<div class="button-toSeller">
			<button @click="toSeller">我是用户</button>
		</div>
		<div class="button-toSeller">
			<button @click="toAdmin">我是管理员</button>
		</div>

		<!-- 底部菜单部分 -->
		<NavFooter></NavFooter>
	</div>
</template>

<script>
	import NavFooter from '@/components/NavFooter.vue';

	export default {
		name: 'UserLogin',
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
					if (error.response?.status === 401) {
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
		height: 100%;

	}

	/****************** header部分 ******************/
	.wrapper header {
		width: 100%;
		height: 12vw;
		background-color: #0097FF;
		color: #fff;
		font-size: 4.8vw;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/****************** 表单部分 ******************/
	.wrapper .form-box {
		width: 100%;
		margin-top: 12vw;
	}

	.wrapper .form-box li {
		box-sizing: border-box;
		padding: 4vw 3vw 0 3vw;
		display: flex;
		align-items: center;
	}

	.wrapper .form-box li .title {
		flex: 0 0 18vw;
		font-size: 3vw;
		font-weight: 700;
		color: #666;
	}

	.wrapper .form-box li .content {
		flex: 1;
	}

	.wrapper .form-box li .content input {
		border: none;
		outline: none;
		width: 100%;
		height: 4vw;
		font-size: 3vw;
	}

	.wrapper .button-login {
		width: 100%;
		box-sizing: border-box;
		padding: 4vw 3vw 0 3vw;
	}

	.wrapper .button-login button {
		width: 100%;
		height: 10vw;
		font-size: 3.8vw;
		font-weight: 700;
		color: #fff;
		background-color: #38CA73;
		border-radius: 4px;
		border: none;
		outline: none;
	}

	.wrapper .button-register {
		width: 100%;
		box-sizing: border-box;
		padding: 4vw 3vw 0 3vw;
	}

	.wrapper .button-register button {
		width: 100%;
		height: 10vw;
		font-size: 3.8vw;
		font-weight: 700;
		color: #666;
		background-color: #EEE;
		border-radius: 4px;
		border: none;
		outline: none;
		border: solid 1px #DDD;
	}

	.wrapper .button-toSeller {
		width: 100%;
		box-sizing: border-box;
		padding: 4vw 3vw 0 3vw;
	}

	.wrapper .button-toSeller button {
		width: 100%;
		height: 10vw;
		font-size: 3.8vw;
		font-weight: 700;
		color: #666;
		background-color: #EEE;
		border-radius: 4px;
		border: none;
		outline: none;
		border: solid 1px #DDD;
	}
</style>