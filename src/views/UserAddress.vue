<template>
	<div class="wrapper">
		<!-- 头部 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<p class="header-title">地址管理</p>
			<div class="header-right"></div>
		</header>

		<!-- 地址列表 -->
		<div class="address-container">
			<!-- 地址卡片：:class 完全手动输入，无任何特殊字符 -->
			<div class="address-card" v-for="(item, index) in deliveryAddressArr" :key="item.id || index"
				@mouseenter="item.hover = true" @mouseleave="item.hover = false"
				:class="{ 'address-card--selected': isSelectedAddress(item.id) }">
				<!-- 地址信息 -->
				<div class="address-info" @click="setDeliveryAddress(item)">
					<div class="contact-row">
						<span class="contact-name">{{ item.contactName }}{{ formatSex(item.contactSex) }}</span>
						<span class="contact-tel">{{ item.contactTel }}</span>
					</div>
					<div class="address-detail">
						{{ item.province }} {{ item.city }} {{ item.district }} {{ item.address }}
					</div>
					<div class="default-tag" v-if="item.isDefault">默认地址</div>
				</div>

				<!-- 操作按钮：:class 手动重写，无空格/特殊字符 -->
				<div class="address-actions">
					<button class="action-btn edit-btn" @click.stop="editUserAddress(item.id)"
						:class="{ 'active': item.hover }">
						<i class="fa fa-edit"></i>
						<span class="btn-text">编辑</span>
					</button>
					<button class="action-btn delete-btn" @click.stop="removeUserAddress(item.id)"
						:class="{ 'active': item.hover }">
						<i class="fa fa-trash"></i>
						<span class="btn-text">删除</span>
					</button>
				</div>
			</div>

			<!-- 空状态 -->
			<div class="empty-tip" v-if="deliveryAddressArr.length === 0">
				<div class="empty-content">
					<i class="fa fa-map-marker-alt empty-icon"></i>
					<p class="empty-title">暂无收货地址</p>
					<p class="empty-desc">点击下方按钮添加您的第一个收货地址吧~</p>
				</div>
			</div>
		</div>

		<!-- 新增按钮 -->
		<button class="add-address-btn" @click="toAddUserAddress">
			<i class="fa fa-plus"></i>
			<span>新增收货地址</span>
		</button>

		<!-- 底部导航 -->
		<NavFooter class="nav-footer"></NavFooter>
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
			deliveryAddressArr: [],
			selectedAddressId: ''
		};
	},
	created() {
		this.user = this.$getSessionStorage('user');
		const selectedAddress = this.$getLocalStorage('selectedDeliveryAddress');
		this.selectedAddressId = selectedAddress?.id || '';
		this.listDeliveryAddressByUserId();
	},
	components: { NavFooter },
	methods: {
		formatSex(value) {
			return value === 1 ? '（女士）' : '（先生）';
		},
		isSelectedAddress(addressId) {
			return this.selectedAddressId === addressId;
		},
		listDeliveryAddressByUserId() {
			this.$axios.get('/api/addresses')
				.then(res => {
					if (res.data?.success && Array.isArray(res.data.data)) {
						this.deliveryAddressArr = res.data.data.map(item => ({ ...item, hover: false }));
					} else {
						this.deliveryAddressArr = [];
					}
				})
				.catch(err => {
					this.deliveryAddressArr = [];
					if (err.response?.status === 401) {
						alert('请重新登录');
						this.$router.push('/login');
					}
				});
		},
		setDeliveryAddress(deliveryAddress) {
			this.$setLocalStorage('selectedDeliveryAddress', deliveryAddress);
			this.selectedAddressId = deliveryAddress.id;
			this.$router.push({
				path: '/orders',
				query: { businessId: this.businessId, address: JSON.stringify(deliveryAddress) }
			});
		},
		toAddUserAddress() {
			this.$router.push({ path: '/addUserAddress', query: { businessId: this.businessId } });
		},
		editUserAddress(addressId) {
			this.$router.push({
				path: '/editUserAddress',
				query: { businessId: this.businessId, addressId: addressId }
			});
		},
		removeUserAddress(addressId) {
			if (!confirm('确认删除？')) return;
			this.$axios.delete(`/api/addresses/${addressId}`)
				.then(res => {
					if (res.data?.success) {
						this.deliveryAddressArr = this.deliveryAddressArr.filter(item => item.id !== addressId);
						if (this.selectedAddressId === addressId) {
							this.selectedAddressId = '';
							this.$removeLocalStorage('selectedDeliveryAddress');
						}
						alert('删除成功');
					} else {
						alert('删除失败');
					}
				})
				.catch(() => {
					alert('删除失败，请重试');
				});
		}
	}
};
</script>

<style scoped>
.wrapper {
	width: 100%;
	min-height: 100vh;
	background-color: #fcfcfa;
	padding-bottom: 80px;
	box-sizing: border-box;
}

.header {
	width: 100%;
	height: 60px;
	background: #fff;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	padding: 0 24px;
	box-sizing: border-box;
}

.back-box {
	width: 40px;
	height: 40px;
	border-radius: 8px;
	background: #f5f5f2;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}

.back-box:hover {
	background: #ebebe6;
}

.back-symbol {
	font-size: 20px;
	color: #5d5a56;
	font-weight: 500;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 18px;
	font-weight: 500;
	color: #33312e;
}

.header-right {
	width: 40px;
}

.address-container {
	max-width: 1200px;
	width: 100%;
	margin: 80px auto 24px;
	padding: 0 24px;
	box-sizing: border-box;
}

.address-card {
	width: 100%;
	background: #fff;
	border-radius: 12px;
	padding: 24px;
	margin-bottom: 16px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
	display: flex;
	justify-content: space-between;
	align-items: center;
	transition: all 0.3s;
	border: 2px solid transparent;
	box-sizing: border-box;
	cursor: pointer;
}

.address-card:hover {
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
	transform: translateY(-2px);
	border-color: #f0efe9;
}

.address-card--selected {
	border-color: #8faca5 !important;
	box-shadow: 0 4px 16px rgba(143, 172, 165, 0.15);
}

.address-info {
	flex: 1;
	margin-right: 24px;
}

.contact-row {
	display: flex;
	align-items: center;
	margin-bottom: 8px;
}

.contact-name {
	font-size: 16px;
	font-weight: 500;
	color: #33312e;
	margin-right: 24px;
}

.contact-tel {
	font-size: 14px;
	color: #7d7a76;
}

.address-detail {
	font-size: 14px;
	color: #7d7a76;
	line-height: 1.6;
	margin-bottom: 8px;
	word-break: break-all;
}

.default-tag {
	display: inline-block;
	background: #f5f5f2;
	color: #7d7a76;
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 4px;
}

.address-actions {
	display: flex;
	gap: 16px;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	background: transparent;
	border: none;
	cursor: pointer;
	font-size: 14px;
	padding: 8px 12px;
	border-radius: 6px;
	transition: all 0.2s;
}

.edit-btn {
	color: #8faca5;
}

.edit-btn.active,
.edit-btn:hover {
	color: #789a94;
	background: #f8f5ea;
}

.delete-btn {
	color: #a0522d;
}

.delete-btn.active,
.delete-btn:hover {
	color: #8b4513;
	background: #fef6f2;
}

.btn-text {
	white-space: nowrap;
}

.add-address-btn {
	max-width: 1200px;
	width: 100%;
	height: 56px;
	margin: 0 auto 32px;
	background: #8faca5;
	color: #fff;
	border: none;
	border-radius: 12px;
	font-size: 16px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	cursor: pointer;
	transition: all 0.2s;
	padding: 0 24px;
	box-sizing: border-box;
}

.add-address-btn:hover {
	background: #789a94;
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(143, 172, 165, 0.2);
}

.empty-tip {
	width: 100%;
	height: 300px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 40px;
}

.empty-content {
	text-align: center;
}

.empty-icon {
	font-size: 80px;
	color: #e0dedb;
	margin-bottom: 24px;
	animation: float 2.5s ease-in-out infinite;
}

.empty-title {
	font-size: 18px;
	color: #7d7a76;
	margin-bottom: 12px;
}

.empty-desc {
	font-size: 14px;
	color: #a09c97;
}

@keyframes float {

	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(-12px);
	}
}

@media (max-width:768px) {
	.address-container {
		padding: 0 16px;
	}

	.address-card {
		padding: 16px;
		border-width: 1.5px;
	}

	.contact-name {
		margin-right: 16px;
	}

	.btn-text {
		display: none;
	}

	.address-actions {
		gap: 8px;
	}

	.add-address-btn {
		height: 48px;
		font-size: 14px;
	}
}
</style>