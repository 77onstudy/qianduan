<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>商家登陆</p>
		</header>

		<!-- 表单部分 -->
		<div class="form-box">
			<li>
				<div class="title">
					商家ID：
				</div>
				<div class="content">
					<input type="text" v-model="sellerId" placeholder="商家ID">
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
			<button @click="login">商家登陆</button>
		</div>

		<div class="button-register">
			<button @click="register">商家注册</button>
		</div>
		<div class="button-toSeller">
			<button @click="toUser">我是用户</button>
		</div>

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
				if (this.sellerId == '') {
					alert('商家ID不能为空！');
					return;
				}
				if (this.password == '') {
					alert('密码不能为空！');
					return;
				}
				
				// 登录请求
				this.$setSessionStorage('seller', this.seller);
				this.$router.push({
							path:'/sellerPage',
							query:{businessId :this.seller.businessId}
						})
				// this.$axios.post('SellerController/getSellerByIdByPass', this.$qs.stringify({
				// 	sellerId: this.sellerId,
				// 	password: this.password
				// })).then(response => {
				// 	let seller = response.data.data;
				// 	if (seller == null) {
				// 		alert('用户名或密码不正确！');
				// 	} else {
				// 		// sessionstorage有容量限制，为了防止数据溢出，所以不将userImg数据放入session中
				// 		seller.businessImg = '';
				// 		this.$setSessionStorage('seller', this.seller);
				// 		this.$router.push({
				// 			path:'/sellerPage',
				//			query:{businessId :seller.businessId}
				// 		})
				// 	}
				// }).catch(error => {
				// 	console.error(error);
				// });
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