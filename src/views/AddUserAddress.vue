<template>
	<div class="wrapper">
		<!-- 头部：全屏无间距，完全铺满屏幕宽度 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<h1 class="header-title">新增收货地址</h1>
			<div class="header-right"></div>
		</header>

		<!-- 表单容器：放宽最大宽度，适配大尺寸 -->
		<div class="form-container">
			<div class="form-card">
				<form class="address-form" @submit.prevent="addUserAddress">
					<!-- 联系人 -->
					<div class="form-group">
						<label class="form-label">联系人</label>
						<input type="text" v-model="deliveryAddress.contactName" placeholder="请输入联系人姓名"
							class="form-input" required>
					</div>

					<!-- 性别选择 -->
					<div class="form-group">
						<label class="form-label">性别</label>
						<div class="radio-group">
							<label class="radio-item">
								<input type="radio" v-model="deliveryAddress.contactSex" value="1" class="radio-input">
								<span class="radio-text">男</span>
							</label>
							<label class="radio-item">
								<input type="radio" v-model="deliveryAddress.contactSex" value="0" class="radio-input">
								<span class="radio-text">女</span>
							</label>
						</div>
					</div>

					<!-- 电话 -->
					<div class="form-group">
						<label class="form-label">电话</label>
						<input type="tel" v-model="deliveryAddress.contactTel" placeholder="请输入联系电话" class="form-input"
							required>
					</div>

					<!-- 收货地址 -->
					<div class="form-group">
						<label class="form-label">收货地址</label>
						<input type="text" v-model="deliveryAddress.address" placeholder="请输入详细收货地址（如：XX小区XX栋XX单元XX室）"
							class="form-input" required>
					</div>

					<!-- 保存按钮：大幅放大，突出操作 -->
					<div class="form-actions">
						<button type="submit" class="save-btn" :disabled="isSubmitting">
							<span v-if="!isSubmitting">保存地址</span>
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
	name: 'AddUserAddress',
	data() {
		return {
			businessId: this.$route.query.businessId,
			user: {},
			isSubmitting: false,
			deliveryAddress: {
				contactName: '',
				contactSex: 1,
				contactTel: '',
				address: ''
			}
		};
	},
	created() {
		this.user = this.$getSessionStorage('user') || {};
	},
	components: {
		NavFooter
	},
	methods: {
		addUserAddress() {
			// 表单验证
			if (!this.deliveryAddress.contactName.trim()) {
				alert('联系人姓名不能为空！');
				return;
			}
			if (!this.deliveryAddress.contactTel.trim()) {
				alert('联系电话不能为空！');
				return;
			}
			if (!this.deliveryAddress.address.trim()) {
				alert('收货地址不能为空！');
				return;
			}

			// 构建请求数据
			const requestData = {
				contactName: this.deliveryAddress.contactName.trim(),
				contactSex: parseInt(this.deliveryAddress.contactSex, 10),
				contactTel: this.deliveryAddress.contactTel.trim(),
				address: this.deliveryAddress.address.trim(),
				userId: this.user.userId,
				businessId: this.businessId
			};

			this.isSubmitting = true;

			this.$axios.post('/api/addresses', requestData)
				.then((response) => {
					if (response.data?.success) {
						alert('地址添加成功！');
						this.$router.push({
							path: '/userAddress',
							query: { businessId: this.businessId }
						});
					} else {
						console.error('新增地址失败:', response.data);
						alert(`新增地址失败：${response.data?.message || '服务器处理异常'}`);
					}
				})
				.catch((error) => {
					console.error('请求失败:', error);
					if (error.response) {
						switch (error.response.status) {
							case 400:
								alert('输入信息有误，请检查后重试');
								break;
							case 401:
								alert('登录已过期，请重新登录');
								this.$router.push('/login');
								break;
							case 500:
								alert('服务器错误，请稍后重试');
								break;
							default:
								alert('网络请求失败，请稍后重试');
						}
					} else {
						alert('网络连接失败，请检查网络');
					}
				})
				.finally(() => {
					this.isSubmitting = false;
				});
		}
	}
};
</script>

<style scoped>
/* 全局容器 */
.wrapper {
	width: 100%;
	min-height: 100vh;
	background-color: #fcfcfa;
	padding-bottom: 90px;
	/* 底部导航空间放大 */
	box-sizing: border-box;
}

/* 头部：完全铺满屏幕（无左右边距），高度大幅增加 */
.header {
	width: 100%;
	/* 全屏宽度 */
	height: 80px;
	/* 高度放大33% */
	background-color: #ffffff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
	/* 阴影加深，增强层次感 */
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	padding: 0 36px;
	/* 内边距放大，避免内容贴边 */
	margin: 0;
	/* 清除默认margin，确保全屏 */
	box-sizing: border-box;
}

/* 返回按钮：大幅放大，增强点击体验 */
.back-box {
	width: 50px;
	/* 宽度放大20% */
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
	/* 返回符号放大30% */
	color: #5d5a56;
	font-weight: 600;
}

/* 标题：超大字体，居中醒目 */
.header-title {
	flex: 1;
	text-align: center;
	font-size: 24px;
	/* 字体放大33% */
	font-weight: 600;
	color: #33312e;
	margin: 0;
}

.header-right {
	width: 50px;
	/* 与返回按钮同宽，保持对称 */
}

/* 表单容器：放宽最大宽度，上下间距放大 */
.form-container {
	width: 100%;
	max-width: 1000px;
	/* 最大宽度放大20% */
	margin: 100px auto 40px;
	/* 上间距=头部高度80px+20px，整体放大 */
	padding: 0 36px;
	/* 内边距放大，与头部呼应 */
	box-sizing: border-box;
}

/* 表单卡片：内边距大幅增加，避免内容拥挤 */
.form-card {
	background-color: #ffffff;
	border-radius: 14px;
	/* 圆角略放大 */
	box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
	/* 阴影略加深 */
	padding: 40px;
	/* 内边距放大20% */
	box-sizing: border-box;
}

/* 表单组：间距大幅增加，提升呼吸感 */
.address-form {
	width: 100%;
}

.form-group {
	display: flex;
	align-items: center;
	margin-bottom: 36px;
	/* 表单项间距放大50% */
}

/* 表单标签：宽度和字体同步放大 */
.form-label {
	width: 130px;
	/* 标签宽度放大30% */
	font-size: 18px;
	/* 字体放大20% */
	color: #33312e;
	font-weight: 500;
	text-align: right;
	margin-right: 28px;
	/* 与输入框间距放大30% */
}

/* 输入框：高度和字体大幅放大，增强视觉 */
.form-input {
	flex: 1;
	height: 56px;
	/* 高度放大27% */
	padding: 0 20px;
	/* 内边距放大40% */
	border: 1px solid #e0dedb;
	border-radius: 10px;
	/* 圆角放大 */
	font-size: 17px;
	/* 字体放大15% */
	color: #33312e;
	transition: all 0.2s;
	box-sizing: border-box;
}

.form-input:focus {
	outline: none;
	border-color: #8faca5;
	box-shadow: 0 0 0 4px rgba(143, 172, 165, 0.15);
	/* 聚焦阴影放大 */
}

.form-input::placeholder {
	color: #a09c97;
	font-size: 17px;
	/* 占位符同步放大 */
}

/* 性别选择：选项和文字大幅放大 */
.radio-group {
	flex: 1;
	display: flex;
	gap: 48px;
	/* 选项间距放大60% */
}

.radio-item {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.radio-input {
	width: 22px;
	/* 单选框放大35% */
	height: 22px;
	margin: 0 12px 0 0;
	/* 与文字间距放大50% */
	accent-color: #8faca5;
}

.radio-text {
	font-size: 17px;
	/* 文字放大15% */
	color: #33312e;
}

/* 按钮区域：左间距与标签对齐，上间距放大 */
.form-actions {
	margin-top: 44px;
	/* 上间距放大30% */
	padding-left: 158px;
	/* 左间距=标签宽度130px+间距28px，确保对齐 */
}

/* 保存按钮：超大尺寸，突出核心操作 */
.save-btn {
	width: 100%;
	max-width: 380px;
	/* 最大宽度放大18% */
	height: 64px;
	/* 高度放大28% */
	background-color: #8faca5;
	color: #ffffff;
	border: none;
	border-radius: 10px;
	/* 圆角放大 */
	font-size: 19px;
	/* 字体放大12% */
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
	/* 悬停阴影放大 */
	transform: translateY(-2px);
	/* 上浮更明显 */
}

.save-btn:disabled {
	background-color: #c9c6c1;
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

/* 底部导航：全屏铺满，与头部呼应 */
.nav-footer {
	width: 100%;
	/* 全屏宽度 */
	padding: 12px 0;
	/* 内边距放大50% */
	border-radius: 14px 14px 0 0;
	/* 圆角与卡片呼应 */
	box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.05);
	/* 阴影略加深 */
	margin: 0;
	/* 清除默认margin，确保全屏 */
}

/* 响应式适配：小屏同步放大，保持比例 */
@media (max-width: 768px) {
	.header {
		height: 70px;
		/* 小屏头部略缩，但仍比之前大 */
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
		/* 下间距放大 */
		margin-right: 0;
		font-size: 17px;
	}

	.form-input {
		width: 100%;
		height: 52px;
		/* 小屏输入框高度 */
		font-size: 16px;
	}

	.radio-group {
		width: 100%;
		margin-top: 12px;
		/* 上间距放大 */
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
		/* 小屏按钮高度 */
		font-size: 18px;
	}

	.nav-footer {
		padding: 10px 0;
	}
}
</style>