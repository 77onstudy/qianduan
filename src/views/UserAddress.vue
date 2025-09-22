<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>地址管理</p>
		</header>

		<!-- 地址列表部分 -->
		<div class="addresslist">
			<li v-for="item in deliveryAddressArr" :key="item.id"> <!-- 键改为 id -->
				<div class="addresslist-left" @click="setDeliveryAddress(item)">
					<h3>{{item.contactName}}{{formatSex(item.contactSex)}} {{item.contactTel}}</h3>
					<p>{{item.address}}</p>
				</div>
				<div class="addresslist-right">
					<i class="fa fa-edit" @click="editUserAddress(item.id)"></i> <!-- 改为 id -->
					<i class="fa fa-remove" @click="removeUserAddress(item.id)"></i> <!-- 改为 id -->
				</div>
			</li>
		</div>

		<!-- 新增地址部分 -->
		<div class="addbtn" @click="toAddUserAddress">
			<i class="fa fa-plus-circle"></i>
			<p>新增收货地址</p>
		</div>

		<!-- 底部菜单部分 -->
		<NavFooter></NavFooter>
	</div>
</template>

<script>
	import NavFooter from '../components/NavFooter.vue';

	export default {
		name: 'UserAddress',
		data() {
			return {
				businessId: this.$route.query.businessId,
				user: {},
				deliveryAddressArr: []
			}
		},
		created() {
			this.user = this.$getSessionStorage('user');
			this.listDeliveryAddressByUserId();
		},
		components: {
			NavFooter
		},
		methods: {
			formatSex(value) {
				return value == 1 ? '女士' : '先生'; // 根据后端实体，0-男，1-女
			},
			listDeliveryAddressByUserId() {
				// 获取当前用户的地址列表 GET /api/addresses
				this.$axios.get('/api/addresses') // 使用GET请求
					.then(response => {
						console.log('地址接口完整响应:', response); // 调试用
						// 根据你提供的实际响应结构，数据在 response.data.data 中，成功标志是 response.data.success
						if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
							this.deliveryAddressArr = response.data.data;
							console.log('成功获取地址列表:', this.deliveryAddressArr); // 调试用
						} else {
							console.error('返回数据格式错误或操作失败', response.data);
							this.deliveryAddressArr = [];
							// 可以根据 response.data.message 提示用户
							// 例如：this.$message.error(response.data.message || '获取地址失败');
						}
					}).catch(error => {
						console.error('获取地址列表失败:', error);
						if (error.response) {
							// 根据HTTP状态码处理不同错误
							switch (error.response.status) {
								case 404:
									this.deliveryAddressArr = [];
									// this.$message.info('暂无收货地址');
									break;
								case 401:
									// this.$message.error('请重新登录');
									// 可能需要跳转到登录页
									break;
								case 500:
									// this.$message.error('服务器错误，请稍后重试');
									break;
								default:
									// this.$message.error('获取地址失败，请重试');
							}
						} else {
							// 网络错误或请求被取消等情况
							// this.$message.error('网络连接失败，请检查网络');
						}
					});
			},
			setDeliveryAddress(deliveryAddress) {
				// 把用户选择的默认送货地址存储到localStorage中
				this.$setLocalStorage('selectedDeliveryAddress', deliveryAddress);
				this.$router.push({
					path: '/orders',
					query: {
						businessId: this.businessId
					}
				});
			},
			toAddUserAddress() {
				this.$router.push({
					path: '/addUserAddress',
					query: {
						businessId: this.businessId
					}
				});
			},
			editUserAddress(addressId) {
				this.$router.push({
					path: '/editUserAddress', // 你的编辑页面路由
					query: {
						businessId: this.businessId,
						addressId: addressId // 传递地址ID
					}
				});
			},
			removeUserAddress(addressId) {
				if (!confirm('确认要删除此送货地址吗？')) {
					return;
				}
				// 删除地址 DELETE /api/addresses/{id}
				this.$axios.delete(`/api/addresses/${addressId}`)
					.then(response => {
						// 根据你提供的实际响应结构，成功标志是 response.data.success
						if (response.data && response.data.success === true) {

							// *** 核心修改：直接从前端的地址数组中移除已删除的项 ***
							this.deliveryAddressArr = this.deliveryAddressArr.filter(item => item.id !== addressId);

							// 从本地存储中移除已删除的地址（如果是当前选中的）
							let selectedAddress = this.$getLocalStorage('selectedDeliveryAddress');
							if (selectedAddress && selectedAddress.id === addressId) {
								this.$removeLocalStorage('selectedDeliveryAddress');
							}

							// 可以在这里给出成功提示
							// this.$message.success('地址删除成功');
						} else {
							console.error('删除失败，服务器返回错误:', response.data);
							// this.$message.error('删除地址失败！' + (response.data.message || ''));
						}
					}).catch(error => {
						console.error('删除地址失败:', error);
						if (error.response) {
							switch (error.response.status) {
								case 404:
									// this.$message.error('地址不存在');
									break;
								case 401:
									// this.$message.error('请重新登录');
									break;
								default:
									// this.$message.error('删除地址失败，请重试');
							}
						} else {
							// this.$message.error('网络连接失败，请检查网络');
						}
					});
			}
		}
	}
</script>

<style scoped>
	/*************** 总容器 ***************/
	.wrapper {
		width: 100%;
		height: 100%;
		background-color: #F5F5F5;
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

	/*************** addresslist ***************/
	.wrapper .addresslist {
		width: 100%;
		margin-top: 12vw;
		background-color: #fff;
	}

	.wrapper .addresslist li {
		width: 100%;
		box-sizing: border-box;
		border-bottom: solid 1px #DDD;
		padding: 3vw;
		display: flex;
	}

	.wrapper .addresslist li .addresslist-left {
		flex: 5;
		user-select: none;
		cursor: pointer;
	}

	.wrapper .addresslist li .addresslist-left h3 {
		font-size: 4.6vw;
		font-weight: 300;
		color: #666;
	}

	.wrapper .addresslist li .addresslist-left p {
		font-size: 4vw;
		color: #666;
	}

	.wrapper .addresslist li .addresslist-right {
		flex: 1;
		font-size: 5.6vw;
		color: #999;
		cursor: pointer;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	/*************** 新增地址部分 ***************/
	.wrapper .addbtn {
		width: 100%;
		height: 14vw;
		border-top: solid 1px #DDD;
		border-bottom: solid 1px #DDD;
		background-color: #fff;
		margin-top: 4vw;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 4.5vw;
		color: #0097FF;
		user-select: none;
		cursor: pointer;
	}

	.wrapper .addbtn p {
		margin-left: 2vw;
	}
</style>