<template>
	<div class="wrapper">
		<!-- 表单部分 -->
		<form @submit.prevent="submitForm">
			<input type="text" v-model="formData.contactName" placeholder="联系人姓名" required>
			<select v-model="formData.contactSex">
				<option :value="0">先生</option>
				<option :value="1">女士</option>
			</select>
			<input type="tel" v-model="formData.contactTel" placeholder="联系电话">
			<input type="text" v-model="formData.address" placeholder="详细地址" required>
			<button type="submit">保存修改</button>
		</form>
	</div>
</template>

<script>
	export default {
		name: 'EditUserAddress',
		data() {
			return {
				businessId: this.$route.query.businessId,
				addressId: this.$route.query.addressId,
				formData: {
					id: this.$route.query.addressId, // 确保id字段存在
					contactName: '',
					contactSex: null,
					contactTel: '',
					address: ''
					// 添加其他后端需要的字段
				}
			};
		},
		created() {
			this.fetchAddressData();
		},
		methods: {
			fetchAddressData() {
				// 根据addressId获取地址详细信息
				this.$axios.get(`/api/addresses/${this.addressId}`)
					.then(response => {
						if (response.data && response.data.success) {
							// 将获取到的数据填入formData
							this.formData = {
								...response.data.data,
								id: this.addressId // 确保id不被覆盖
							};
						}
					})
					.catch(error => {
						console.error('获取地址详情失败:', error);
					});
			},
			submitForm() {
				if (!this.validateForm()) {
					return;
				}

				this.$axios.patch('/api/addresses', this.formData)
					.then(response => {
						// 修改这里的判断逻辑
						if (response && response.data && response.data.success) {
							console.log('地址修改成功:', response.data);
							alert('地址修改成功');
							this.$router.push({
								path: '/userAddress',
									businessId: this.businessId
								});
						} else {
							console.error('修改失败:', response);
							this.$message.error('修改失败: ' + ((response && response.data && response.data.message) ||
								'未知错误'));
						}
					})
					.catch(error => {
						console.error('提交修改失败:', error);
						// 直接传递错误对象，不调用handleApiError
						if (error && error.response) {
							this.handleApiError(error);
						} else {
							this.$message.error('网络错误或请求配置异常: ' + (error.message || '未知错误'));
						}
					});
			},

			validateForm() {
				// 简单的表单验证示例
				if (!this.formData.contactName.trim()) {
					this.$message.warning('请输入联系人姓名');
					return false;
				}
				if (!this.formData.contactTel.trim()) {
					this.$message.warning('请输入联系电话');
					return false;
				}
				if (!this.formData.address.trim()) {
					this.$message.warning('请输入详细地址');
					return false;
				}
				return true;
			},

			handleApiError(error) {
				// 添加更安全的属性访问
				if (error && error.response) {
					const status = error.response.status;
					const errorData = error.response.data || {};

					switch (status) {
						case 404:
							this.$message.error('地址不存在');
							break;
						case 400:
							this.$message.error('请求参数错误：' +
								(errorData.message || '请检查填写内容'));
							break;
						case 401:
							this.$message.error('未授权，请登录');
							break;
						case 500:
							this.$message.error('服务器内部错误，请稍后重试');
							break;
						default:
							this.$message.error('修改地址失败，请重试');
					}
				} else if (error && error.request) {
					// 请求已发出但没有收到响应[6](@ref)
					this.$message.error('网络异常，请检查网络连接');
				} else {
					// 其他错误
					this.$message.error('操作失败: ' + (error.message || '未知错误'));
				}
			}
		}
	};
</script>
<style scoped>
	/*************** 总容器 ***************/
	/*************** 总容器 - 优化后 ***************/
	.wrapper {
		width: 100%;
		min-height: 1000vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
		padding: 16vw 4vw 20vw;
		box-sizing: border-box;
		font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
	}

	/*************** 表单容器 - 优化后 ***************/
	.wrapper form {
		background-color: #ffffff;
		border-radius: 16px;
		padding: 8vw 6vw;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
		margin-bottom: 5vw;
		transition: all 0.3s ease;
	}

	.wrapper form:hover {
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
	}

	/*************** 表单输入组 - 优化后 ***************/
	.wrapper .input-group {
		margin-bottom: 6vw;
		position: relative;
	}

	.wrapper .input-group:last-of-type {
		margin-bottom: 4vw;
	}

	.wrapper .input-group label {
		display: block;
		font-size: 3.8vw;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 3vw;
		transition: color 0.3s ease;
	}

	.wrapper .input-group input,
	.wrapper .input-group select {
		width: 100%;
		padding: 4vw 4.5vw;
		font-size: 4.2vw;
		border: 1.5px solid #e0e6ed;
		border-radius: 12px;
		box-sizing: border-box;
		transition: all 0.3s ease;
		background-color: #fafbfc;
		color: #2c3e50;
	}

	.wrapper .input-group input:focus,
	.wrapper .input-group select:focus {
		outline: none;
		border-color: #409eff;
		box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
		background-color: #fff;
		transform: translateY(-2px);
	}

	.wrapper .input-group input::placeholder {
		color: #a8b5c1;
		font-size: 4vw;
	}

	/*************** 下拉选择框特定样式 - 优化后 ***************/
	.wrapper .input-group select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2390a4ae'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 4vw center;
		background-size: 5vw;
		padding-right: 12vw;
		cursor: pointer;
	}

	.wrapper .input-group select:hover {
		border-color: #c0c4cc;
	}

	/*************** 提交按钮 - 优化后 ***************/
	.wrapper .submit-btn {
		width: 100%;
		padding: 4.5vw;
		background: linear-gradient(135deg, #0097ff 0%, #0066cc 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 4.5vw;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 5vw;
		box-shadow: 0 4px 15px rgba(0, 151, 255, 0.4);
		letter-spacing: 1px;
	}

	.wrapper .submit-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 7px 20px rgba(0, 151, 255, 0.5);
	}

	.wrapper .submit-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 151, 255, 0.4);
	}

	/*************** 表单验证样式 - 优化后 ***************/
	.wrapper .input-group.error input,
	.wrapper .input-group.error select {
		border-color: #f56c6c;
		box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.15);
	}

	.wrapper .error-message {
		color: #f56c6c;
		font-size: 3.5vw;
		margin-top: 2vw;
		display: block;
		font-weight: 500;
	}

	/*************** 响应式设计 - 平板和桌面 - 优化后 ***************/
	@media (min-width: 768px) {
		.wrapper {
			padding: 10vw 15vw;
			background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
		}

		.wrapper form {
			padding: 6vw 7vw;
			border-radius: 20px;
		}

		.wrapper .input-group {
			margin-bottom: 4.5vw;
		}

		.wrapper .input-group label {
			font-size: 2.2vw;
			margin-bottom: 2vw;
		}

		.wrapper .input-group input,
		.wrapper .input-group select {
			padding: 2.8vw 3.5vw;
			font-size: 2.5vw;
			border-radius: 14px;
		}

		.wrapper .input-group input::placeholder {
			font-size: 2.5vw;
		}

		.wrapper .submit-btn {
			padding: 3vw;
			font-size: 2.8vw;
			border-radius: 14px;
			margin-top: 4vw;
		}

		.wrapper .input-group select {
			background-position: right 3vw center;
			background-size: 3.5vw;
			padding-right: 10vw;
		}

		.wrapper .error-message {
			font-size: 2vw;
		}
	}

	/*************** 响应式设计 - 大屏设备 - 优化后 ***************/
	@media (min-width: 1024px) {
		.wrapper {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 4vw;
			background: linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%);
		}

		.wrapper form {
			width: 55%;
			max-width: 550px;
			padding: 45px;
			border-radius: 24px;
		}

		.wrapper .input-group {
			margin-bottom: 25px;
		}

		.wrapper .input-group:last-of-type {
			margin-bottom: 20px;
		}

		.wrapper .input-group label {
			font-size: 16px;
			margin-bottom: 10px;
		}

		.wrapper .input-group input,
		.wrapper .input-group select {
			padding: 15px 18px;
			font-size: 16px;
			border-radius: 12px;
		}

		.wrapper .input-group input::placeholder {
			font-size: 15px;
		}

		.wrapper .submit-btn {
			padding: 16px;
			font-size: 18px;
			border-radius: 12px;
			margin-top: 15px;
		}

		.wrapper .input-group select {
			background-position: right 18px center;
			background-size: 16px;
			padding-right: 50px;
		}

		.wrapper .error-message {
			font-size: 14px;
			margin-top: 8px;
		}
	}

	/*************** 新增：成功提交后的反馈样式 ***************/
	.wrapper .success-message {
		color: #67c23a;
		font-size: 4vw;
		text-align: center;
		margin-top: 4vw;
		font-weight: 500;
		animation: fadeIn 0.5s ease;
	}

	@media (min-width: 1024px) {
		.wrapper .success-message {
			font-size: 16px;
			margin-top: 15px;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>