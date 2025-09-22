<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>新增送货地址</p>
		</header>

		<!-- 表单部分 -->
		<ul class="form-box">
			<li>
				<div class="title">
					联系人：
				</div>
				<div class="content">
					<input type="text" v-model="deliveryAddress.contactName" placeholder="联系人姓名">
				</div>
			</li>
			<li>
				<div class="title">
					性别：
				</div>
				<div class="content" style="font-size: 3vw;">
					<input type="radio" v-model="deliveryAddress.contactSex" value="1" style="width:6vw;height:3.2vw;">男
					<input type="radio" v-model="deliveryAddress.contactSex" value="0" style="width:6vw;height:3.2vw;">女
				</div>
			</li>
			<li>
				<div class="title">
					电话：
				</div>
				<div class="content">
					<input type="tel" v-model="deliveryAddress.contactTel" placeholder="电话">
				</div>
			</li>
			<li>
				<div class="title">
					收货地址：
				</div>
				<div class="content">
					<input type="text" v-model="deliveryAddress.address" placeholder="收货地址">
				</div>
			</li>
		</ul>

		<div class="button-add">
			<button @click="addUserAddress">保存</button>
		</div>

		<!-- 底部菜单部分 -->
		<NavFooter></NavFooter>
	</div>
</template>

<script>
	import NavFooter from '../components/NavFooter.vue';

	export default {
		name: 'AddUserAddress',
		data() {
			return {
				businessId: this.$route.query.businessId,
				user: {},
				deliveryAddress: {
					contactName: '',
					contactSex: 1,
					contactTel: '',
					address: ''
				}
			}
		},
		created() {
			this.user = this.$getSessionStorage('user');
		},
		components: {
			NavFooter
		},
		methods: {
			addUserAddress() {
				// 表单验证
				if (this.deliveryAddress.contactName == '') {
					alert('联系人姓名不能为空！');
					return;
				}
				if (this.deliveryAddress.contactTel == '') {
					alert('联系人电话不能为空！');
					return;
				}
				if (this.deliveryAddress.address == '') {
					alert('联系人地址不能为空！');
					return;
				}

				// 构建请求数据
				const requestData = {
					contactName: this.deliveryAddress.contactName,
					contactSex: parseInt(this.deliveryAddress.contactSex),
					contactTel: this.deliveryAddress.contactTel,
					address: this.deliveryAddress.address,
					userId: this.user.userId,
					businessId: this.businessId
				};

				// 显示加载状态（可选）
				this.isSubmitting = true;

				this.$axios.post('/api/addresses', requestData)
					.then(response => {
						// 处理成功响应
						if (response.data && response.data.success) {
							// 新增地址成功
							console.log('新增地址成功:', response.data);

							// 提示用户成功
							alert('地址添加成功！');

							// 跳转回地址列表页
							this.$router.push({
								path: '/userAddress',
								query: {
									businessId: this.businessId
								}
							});
						} else {
							// 处理业务逻辑失败
							console.error('新增地址失败:', response.data);
							alert('新增地址失败！' + (response.data.message || ''));
						}
					})
					.catch(error => {
						// 处理网络错误或服务器错误
						console.error('请求失败:', error);

						if (error.response) {
							// 服务器返回了错误状态码
							switch (error.response.status) {
								case 400:
									alert('请求参数错误，请检查填写内容');
									break;
								case 401:
									alert('未授权，请重新登录');
									break;
								case 500:
									alert('服务器内部错误，请稍后重试');
									break;
								default:
									alert('新增地址失败，请稍后重试');
							}
						} else {
							// 网络错误或其他错误
							alert('网络请求失败，请检查网络连接');
						}
					})
					.finally(() => {
						// 无论成功失败，都取消加载状态
						this.isSubmitting = false;
					});
			}
		},
	}	
</script>

<style scoped>
	/*************** 总容器 ***************/
	.wrapper {
		width: 100%;
		height: 100%;
	}

	/*************** header ***************/
	.wrapper header {
		width: 100%;
		height: 12vw;
		background-color: #0097FF;
		display: flex;
		justify-content: space-around;
		align-items: center;
		color: #fff;
		font-size: 4.8vw;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 1000;
	}

	/*************** （表单信息） ***************/
	.wrapper .form-box {
		width: 100%;
		margin-top: 12vw;
	}

	.wrapper .form-box li {
		box-sizing: border-box;
		padding: 4vw 3vw 0vw 3vw;
		display: flex;
	}

	.wrapper .form-box li .title {
		flex: 0 0 18vw;
		font-size: 3vw;
		font-weight: 700;
		color: #666;
	}

	.wrapper .form-box li .content {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.wrapper .form-box li .content input {
		border: none;
		outline: none;
		width: 100%;
		height: 4vw;
		font-size: 3vw;
	}

	.wrapper .button-add {
		box-sizing: border-box;
		padding: 4vw 3vw 0vw 3vw;
	}

	.wrapper .button-add button {
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
</style>