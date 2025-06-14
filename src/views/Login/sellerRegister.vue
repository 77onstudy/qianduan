<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>商家注册</p>
		</header>

		<!-- 表单部分 -->
		<div class="form-box">
			<li>
				<div class="title">
					商家名称：
				</div>
				<div class="content">
					<input type="text" @blur="checkSellerId" v-model="seller.sellerId" placeholder="名字">
				</div>
			</li>
			<li>
				<div class="title">
					店名：
				</div>
				<div class="content">
					<input type="text"  v-model="seller.businessName" placeholder="请输入店名">
				</div>
			</li>
			<li>
				<div class="title">
					密码：
				</div>
				<div class="content">
					<input type="password" v-model="seller.password" placeholder="密码">
				</div>
			</li>
			<li>
				<div class="title">
					确认密码：
				</div>
				<div class="content">
					<input type="password" v-model="confirmPassword" placeholder="确认密码">
				</div>
			</li>
		</div>

		<div class="button-login">
			<button @click="register">注册</button>
		</div>

		<!-- 底部菜单部分 -->
		<NavFooter></NavFooter>
	</div>
</template>

<script>
	import NavFooter from '@/components/NavFooter.vue';

	export default {
		name: 'sellerRegister',
		data() {
			return {
				user: {
					userId: '',
					password: '',
					userName: '',
					userSex: 1
				},
				seller:{
					sellerId:"777",
					businessId: null,
					password:"777",
					businessName:"777",
					
				},
				confirmPassword: ''
			}
		},
		methods: {
			checkSellerId() {
				this.$axios.post('SellerController/getSellerById', this.$qs.stringify({
					sellerId: this.seller.sellerId,
				})).then(response => {
					if (!response.data.code) {
						this.seller.sellerId = '';
						alert(response.data.massage);
					}
				}).catch(error => {
					console.error(error);
				});
			},
			register() {
				if (this.seller.sellerId == '') {
					alert('商家名不能为空！');
					return;
				}
				if (this.seller.businessName == '') {
					alert('店铺名不能为空！');
					return;
				}
				if (this.seller.password == '') {
					alert('密码不能为空！');
					return;
				}
				if (this.seller.password != this.confirmPassword) {
					alert('两次输入的密码不一致！');
					return;
				}
				// 注册请求
				this.$axios.post('SellerController/saveSeller', this.$qs.stringify({
					sellerId : this.seller.sellerId,
					businessName :this.seller.businessName,
					password:this.seller.password
				}

					
				)).then(response => {
					if (!response.data.code) {
						this.$router.go(-1);
					} else {
						alert(response.data.massage);
					}
				}).catch(error => {
					console.error(error);
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
</style>