<template>
	<div class="wrapper">
		<!-- 头部：全屏导航，与新增地址页风格统一 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<h1 class="header-title">编辑收货地址</h1>
			<div class="header-right"></div>
		</header>

		<!-- 表单容器：卡片式布局，与新增地址页尺寸匹配 -->
		<div class="form-container">
			<div class="form-card">
				<form class="address-form" @submit.prevent="submitForm">
					<!-- 联系人 -->
					<div class="form-group">
						<label class="form-label">联系人</label>
						<input type="text" v-model="formData.contactName" placeholder="请输入联系人姓名" class="form-input"
							required>
					</div>

					<!-- 性别选择：下拉框改为与新增页一致的单选风格（保持交互统一） -->
					<div class="form-group">
						<label class="form-label">性别</label>
						<div class="radio-group">
							<label class="radio-item">
								<input type="radio" v-model="formData.contactSex" value="0" class="radio-input">
								<span class="radio-text">先生</span>
							</label>
							<label class="radio-item">
								<input type="radio" v-model="formData.contactSex" value="1" class="radio-input">
								<span class="radio-text">女士</span>
							</label>
						</div>
					</div>

					<!-- 电话 -->
					<div class="form-group">
						<label class="form-label">联系电话</label>
						<input type="tel" v-model="formData.contactTel" placeholder="请输入联系电话" class="form-input"
							required>
					</div>

					<!-- 详细地址 -->
					<div class="form-group">
						<label class="form-label">详细地址</label>
						<input type="text" v-model="formData.address" placeholder="请输入详细地址（如：XX小区XX栋XX单元XX室）"
							class="form-input" required>
					</div>

					<!-- 保存按钮：与新增页按钮样式完全一致 -->
					<div class="form-actions">
						<button type="submit" class="save-btn" :disabled="isSubmitting">
							<span v-if="!isSubmitting">保存修改</span>
							<span v-if="isSubmitting">保存中...</span>
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- 底部导航：全屏铺满，与头部呼应 -->
		<NavFooter class="nav-footer"></NavFooter>
	</div>
</template>

<script>
import NavFooter from '../components/NavFooter.vue';

export default {
	name: 'EditUserAddress',
	data() {
		return {
			businessId: this.$route.query.businessId,
			addressId: this.$route.query.addressId,
			isSubmitting: false, // 提交状态控制
			formData: {
				id: this.$route.query.addressId,
				contactName: '',
				contactSex: 0, // 默认先生（与新增页保持一致）
				contactTel: '',
				address: ''
			}
		};
	},
	created() {
		this.fetchAddressData();
	},
	components: {
		NavFooter
	},
	methods: {
		// 获取地址详情数据
		fetchAddressData() {
			this.$axios.get(`/api/addresses/${this.addressId}`)
				.then((response) => {
					if (response.data?.success) {
						// 填充表单数据（保持与新增页数据结构一致）
						this.formData = {
							...response.data.data,
							id: this.addressId // 确保id正确
						};
					} else {
						alert('获取地址详情失败，请刷新重试');
					}
				})
				.catch((error) => {
					console.error('获取地址详情失败:', error);
					if (error.response?.status === 404) {
						alert('该地址不存在或已被删除');
						this.$router.push({
							path: '/userAddress',
							query: { businessId: this.businessId }
						});
					} else if (error.response?.status === 401) {
						alert('登录已过期，请重新登录');
						this.$router.push('/login');
					} else {
						alert('网络错误，获取地址失败');
					}
				});
		},

		// 提交表单
		submitForm() {
			if (!this.validateForm()) return;

			this.isSubmitting = true;

			this.$axios.patch('/api/addresses', this.formData)
				.then((response) => {
					if (response.data?.success) {
						alert('地址修改成功！');
						this.$router.push({
							path: '/userAddress',
							query: { businessId: this.businessId }
						});
					} else {
						console.error('修改失败:', response.data);
						alert(`修改失败：${response.data?.message || '服务器处理异常'}`);
					}
				})
				.catch((error) => {
					console.error('提交修改失败:', error);
					if (error.response) {
						switch (error.response.status) {
							case 400:
								alert('输入信息有误，请检查后重试');
								break;
							case 404:
								alert('地址不存在，无法修改');
								this.$router.push({
									path: '/userAddress',
									query: { businessId: this.businessId }
								});
								break;
							case 401:
								alert('未授权，请重新登录');
								this.$router.push('/login');
								break;
							case 500:
								alert('服务器错误，请稍后重试');
								break;
							default:
								alert('修改地址失败，请重试');
						}
					} else {
						alert('网络连接失败，请检查网络');
					}
				})
				.finally(() => {
					this.isSubmitting = false;
				});
		},

		// 表单验证（与新增页验证规则一致）
		validateForm() {
			if (!this.formData.contactName.trim()) {
				alert('请输入联系人姓名');
				return false;
			}
			if (!this.formData.contactTel.trim()) {
				alert('请输入联系电话');
				return false;
			}
			if (!this.formData.address.trim()) {
				alert('请输入详细地址');
				return false;
			}
			return true;
		}
	}
};
</script>

<style scoped>
/* 全局容器：与新增地址页完全一致 */
.wrapper {
	width: 100%;
	min-height: 100vh;
	background-color: #fcfcfa;
	padding-bottom: 90px;
	/* 底部导航空间 */
	box-sizing: border-box;
}

/* 头部：全屏无间距，尺寸与新增页统一 */
.header {
	width: 100%;
	/* 全屏宽度 */
	height: 80px;
	/* 与新增页相同高度 */
	background-color: #ffffff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	padding: 0 36px;
	margin: 0;
	box-sizing: border-box;
}

/* 返回按钮：与新增页尺寸一致 */
.back-box {
	width: 50px;
	height: 50px;
	border-radius: 10px;
	background-color: #f5f5f2;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}

.back-box:hover {
	background-color: #ebebe6;
}

.back-symbol {
	font-size: 26px;
	color: #5d5a56;
	font-weight: 600;
}

/* 标题：与新增页字体大小一致 */
.header-title {
	flex: 1;
	text-align: center;
	font-size: 24px;
	font-weight: 600;
	color: #33312e;
	margin: 0;
}

.header-right {
	width: 50px;
	/* 保持对称 */
}

/* 表单容器：与新增页布局参数一致 */
.form-container {
	width: 100%;
	max-width: 1000px;
	margin: 100px auto 40px;
	/* 与新增页相同的上间距 */
	padding: 0 36px;
	box-sizing: border-box;
}

/* 表单卡片：样式与新增页完全一致 */
.form-card {
	background-color: #ffffff;
	border-radius: 14px;
	box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
	padding: 40px;
	box-sizing: border-box;
}

/* 表单组：间距与新增页统一 */
.address-form {
	width: 100%;
}

.form-group {
	display: flex;
	align-items: center;
	margin-bottom: 36px;
	/* 与新增页相同的表单项间距 */
}

/* 表单标签：尺寸与新增页一致 */
.form-label {
	width: 130px;
	font-size: 18px;
	color: #33312e;
	font-weight: 500;
	text-align: right;
	margin-right: 28px;
}

/* 输入框：样式与新增页完全一致 */
.form-input {
	flex: 1;
	height: 56px;
	padding: 0 20px;
	border: 1px solid #e0dedb;
	border-radius: 10px;
	font-size: 17px;
	color: #33312e;
	transition: all 0.2s;
	box-sizing: border-box;
}

.form-input:focus {
	outline: none;
	border-color: #8faca5;
	/* 绿色主调聚焦边框（与新增页一致） */
	box-shadow: 0 0 0 4px rgba(143, 172, 165, 0.15);
}

.form-input::placeholder {
	color: #a09c97;
	font-size: 17px;
}

/* 性别选择：复用新增页的单选样式（保持交互统一） */
.radio-group {
	flex: 1;
	display: flex;
	gap: 48px;
}

.radio-item {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.radio-input {
	width: 22px;
	height: 22px;
	margin: 0 12px 0 0;
	accent-color: #8faca5;
	/* 绿色主调单选框 */
}

.radio-text {
	font-size: 17px;
	color: #33312e;
}

/* 按钮区域：与新增页对齐方式一致 */
.form-actions {
	margin-top: 44px;
	padding-left: 158px;
	/* 与标签宽度+间距匹配 */
}

/* 保存按钮：与新增页按钮样式完全一致 */
.save-btn {
	width: 100%;
	max-width: 380px;
	height: 64px;
	background-color: #8faca5;
	/* 绿色主调按钮 */
	color: #ffffff;
	border: none;
	border-radius: 10px;
	font-size: 19px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.save-btn:hover {
	background-color: #789a94;
	box-shadow: 0 5px 18px rgba(143, 172, 165, 0.25);
	transform: translateY(-2px);
}

.save-btn:disabled {
	background-color: #c9c6c1;
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

/* 底部导航：全屏铺满，与新增页一致 */
.nav-footer {
	width: 100%;
	padding: 12px 0;
	border-radius: 14px 14px 0 0;
	box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.05);
	margin: 0;
}

/* 响应式适配：与新增页规则完全一致 */
@media (max-width: 768px) {
	.header {
		height: 70px;
		padding: 0 24px;
	}

	.back-box {
		width: 44px;
		height: 44px;
	}

	.back-symbol {
		font-size: 22px;
	}

	.header-title {
		font-size: 22px;
	}

	.form-container {
		padding: 0 24px;
		margin: 90px auto 30px;
	}

	.form-card {
		padding: 32px 20px;
	}

	.form-group {
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 30px;
	}

	.form-label {
		width: 100%;
		text-align: left;
		margin-bottom: 12px;
		margin-right: 0;
		font-size: 17px;
	}

	.form-input {
		width: 100%;
		height: 52px;
		font-size: 16px;
	}

	.radio-group {
		width: 100%;
		margin-top: 12px;
		gap: 36px;
	}

	.radio-input {
		width: 20px;
		height: 20px;
	}

	.form-actions {
		padding-left: 0;
		margin-top: 36px;
	}

	.save-btn {
		width: 100%;
		max-width: none;
		height: 58px;
		font-size: 18px;
	}

	.nav-footer {
		padding: 10px 0;
	}
}
</style>