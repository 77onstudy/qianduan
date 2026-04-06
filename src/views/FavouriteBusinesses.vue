<template>
	<div class="favourite-page">
		<!-- 头部导航 -->
		<header class="header">
			<div class="back-btn" @click="$router.go(-1)">
				<span class="back-icon">&lt;</span>
			</div>
			<h1 class="page-title">我的收藏</h1>
		</header>

		<!-- 加载状态 -->
		<div class="loading" v-if="isLoading">
			<div class="spinner"></div>
			<p>加载中...</p>
		</div>

		<!-- 收藏列表 -->
		<div class="favourite-list" v-else-if="favouriteBusinesses.length > 0">
			<div 
				class="business-card" 
				v-for="business in favouriteBusinesses" 
				:key="business.id"
				@click="goToBusinessInfo(business.id)"
			>
				<!-- 商家图片 -->
				<div class="business-img">
					<img 
						v-if="business.businessImg" 
						:src="business.businessImg" 
						:alt="business.businessName"
						loading="lazy"
					>
					<div class="img-placeholder" v-else>
						<i class="fa fa-store"></i>
					</div>
				</div>

				<!-- 商家信息 -->
				<div class="business-info">
					<h3 class="business-name">{{ business.businessName }}</h3>
					<p class="business-desc">{{ business.businessExplain || '暂无商家介绍' }}</p>
					<div class="business-meta">
						<span class="meta-item">¥{{ formatPrice(business.startPrice) }}起送</span>
						<span class="meta-split">|</span>
						<span class="meta-item">¥{{ formatPrice(business.deliveryPrice) }}配送</span>
					</div>
				</div>

				<!-- 箭头图标 -->
				<div class="arrow-icon">
					<i class="fa fa-angle-right"></i>
				</div>
			</div>
		</div>

		<!-- 空状态 -->
		<div class="empty-state" v-else>
			<div class="empty-icon">
				<i class="fa fa-heart-o"></i>
			</div>
			<h3 class="empty-title">暂无收藏的商家</h3>
			<p class="empty-desc">快去收藏喜欢的商家吧~</p>
			
		</div>

		<NavFooter />
	</div>
</template>

<script>
import NavFooter from '@/components/NavFooter.vue';

export default {
	name: 'FavouriteBusinesses',
	components: {
		NavFooter
	},
	data() {
		return {
			favouriteBusinesses: [], // 收藏的商家列表
			isLoading: true, // 加载状态
			config: {} // 请求配置（包含token）
		};
	},
	created() {
		// 验证登录状态
		const user = this.$getSessionStorage('user');
		const token = sessionStorage.getItem('token');
		if (!user || !token) {
			alert('请先登录');
			this.$router.push('/login');
			return;
		}

		// 初始化请求配置
		this.config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};

		// 加载收藏列表
		this.loadFavouriteBusinesses();
	},
	methods: {
		// 加载收藏的商家列表
		async loadFavouriteBusinesses() {
			try {
				this.isLoading = true;
				const response = await this.$axios.get('/api/love', this.config);
				
				if (response.data.success) {
					this.favouriteBusinesses = response.data.data || [];
					console.log('收藏的商家列表：', this.favouriteBusinesses);
				} else {
					// 后端返回失败（如"没有找到店铺"）
					this.favouriteBusinesses = [];
				}
			} catch (error) {
				console.error('加载收藏列表失败：', error);
				alert('加载收藏失败，请重试');
				this.favouriteBusinesses = [];
			} finally {
				this.isLoading = false;
			}
		},

		// 跳转到商家详情页
		goToBusinessInfo(businessId) {
			this.$router.push({
				path: '/BusinessInfo',
				query: { businessId }
			});
		},

		// 格式化价格
		formatPrice(price) {
			return (Number(price) || 0).toFixed(2).replace(/\.00$/, '');
		}
	}
};
</script>

<style scoped>
.favourite-page {
	width: 100%;
	min-height: 100vh;
	background-color: #f9f9f9;
	padding-bottom: 60px; /* 留出底部导航空间 */
}

/* 头部样式 */
.header {
	width: 100%;
	height: 56px;
	background-color: #ffffff;
	display: flex;
	align-items: center;
	padding: 0 16px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 100;
}

.back-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	border-radius: 8px;
	background-color: #f5f5f5;
	margin-right: 10px;
}

.back-icon {
	font-size: 20px;
	color: #333;
}

.page-title {
	flex: 1;
	text-align: center;
	font-size: 18px;
	font-weight: 500;
	color: #333;
}

/* 加载状态 */
.loading {
	padding-top: 80px; /* 避开头部 */
	text-align: center;
}

.spinner {
	width: 40px;
	height: 40px;
	margin: 0 auto 16px;
	border: 4px solid #f3f3f3;
	border-top: 4px solid #007bff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

/* 收藏列表 */
.favourite-list {
	padding: 72px 16px 16px; /* 顶部留出头部空间 */
}

.business-card {
	display: flex;
	align-items: center;
	background-color: #ffffff;
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	cursor: pointer;
	transition: transform 0.2s;
}

.business-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.business-img {
	width: 80px;
	height: 80px;
	border-radius: 8px;
	overflow: hidden;
	flex-shrink: 0;
	background-color: #f5f5f5;
}

.business-img img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.img-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #b0b0b0;
	font-size: 32px;
}

.business-info {
	flex: 1;
	margin: 0 16px;
	overflow: hidden;
}

.business-name {
	font-size: 17px;
	font-weight: 500;
	color: #333;
	margin-bottom: 6px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.business-desc {
	font-size: 13px;
	color: #777;
	margin-bottom: 8px;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.business-meta {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: #999;
}

.meta-split {
	margin: 0 6px;
	color: #ddd;
}

.arrow-icon {
	color: #ccc;
	font-size: 20px;
}

/* 空状态 */
.empty-state {
	padding-top: 120px;
	text-align: center;
}

.empty-icon {
	font-size: 72px;
	color: #e0e0e0;
	margin-bottom: 20px;
}

.empty-title {
	font-size: 18px;
	color: #666;
	margin-bottom: 10px;
}

.empty-desc {
	font-size: 14px;
	color: #999;
	margin-bottom: 30px;
}

.empty-state .back-btn {
	background-color: #007bff;
	color: white;
	border: none;
	padding: 10px 24px;
	border-radius: 20px;
	font-size: 14px;
	cursor: pointer;
}

.empty-state .back-btn:hover {
	background-color: #0056b3;
}
</style>