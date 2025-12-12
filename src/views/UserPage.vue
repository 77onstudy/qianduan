<template>
	<div class="points-page">
		<h1 class="title">我的积分</h1>
		
		<div class="card">
			<div v-if="loading" class="status">加载中...</div>
			<div v-else-if="error" class="status error">获取积分失败：{{ error }}</div>
			<div v-else class="points">
				<div class="points-label">当前积分</div>
				<div class="points-value">{{ displayPoints }}</div>
			</div>
			
			<div class="actions">
				<button class="btn" @click="fetchPoints" :disabled="loading">刷新</button>
			</div>
		</div>
		
		<!-- 新增导航按钮区域 -->
		<div class="nav-section">
			<div class="nav-title">积分服务中心</div>
			<div class="nav-buttons">
				<router-link to="/pointsActivity" class="nav-link">
					<div class="nav-icon">🎯</div>
					<div class="nav-text">积分活动</div>
				</router-link>
				<router-link to="/pointsMall" class="nav-link">
					<div class="nav-icon">🛍️</div>
					<div class="nav-text">积分商城</div>
				</router-link>
				<router-link to="/pointsRecord" class="nav-link">
					<div class="nav-icon">📊</div>
					<div class="nav-text">积分流水</div>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'userPoints',
	data() {
		return {
			points: null,
			loading: false,
			error: null,
		};
	},
	computed: {
		displayPoints() {
			return this.points === null ? '--' : this.points;
		},
	},
	methods: {
		async fetchPoints() {
			this.loading = true;
			this.error = null;
			try {
				// 使用项目中封装好的 this.$axios
				const res = await this.$axios.get('/api/points');
		
				// 严格按你规定的结构读取 data.data.totalPoints
				const total = res && res.data && res.data.data && res.data.data.totalPoints;
		
				if (total === undefined || total === null) {
					this.points = 0;
					this.error = '后端返回缺少 data.data.totalPoints';
				} else {
					const n = Number(total);
					this.points = Number.isNaN(n) ? total : n;
				}
			} catch (err) {
				console.error('fetchPoints error', err);
				this.error = err?.message || '网络或服务器错误';
				if (this.points === null) this.points = 0;
			} finally {
				this.loading = false;
			}
		},
	},
	mounted() {
		this.fetchPoints();
	},
};
</script>

<style scoped>
.points-page {
	max-width: 720px;
	margin: 36px auto;
	padding: 18px;
	font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.title {
	text-align: center;
	font-size: 22px;
	font-weight: 700;
	margin-bottom: 18px;
}

.card {
	background: #fff;
	border-radius: 10px;
	padding: 24px;
	box-shadow: 0 6px 18px rgba(31,138,112,0.06);
	text-align: center;
}

.status {
	font-size: 16px;
	color: #666;
	padding: 18px 0;
}

.status.error {
	color: #c0392b;
}

.points-label {
	font-size: 14px;
	color: #888;
	margin-bottom: 8px;
}

.points-value {
	font-size: 40px;
	font-weight: 800;
	color: #1f8a70;
	margin-bottom: 14px;
}

.actions {
	margin-top: 8px;
}

.btn {
	padding: 10px 20px;
	border-radius: 8px;
	border: none;
	background: #1f8a70;
	color: #fff;
	cursor: pointer;
	font-size: 14px;
}

.btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* 新增导航区域样式 */
.nav-section {
	margin-top: 30px;
	background: #fff;
	border-radius: 10px;
	padding: 20px;
	box-shadow: 0 6px 18px rgba(31,138,112,0.06);
}

.nav-title {
	font-size: 16px;
	font-weight: 600;
	color: #333;
	margin-bottom: 15px;
	text-align: center;
}

.nav-buttons {
	display: flex;
	justify-content: space-around;
}

.nav-link {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-decoration: none;
	color: #666;
	width: 80px;
}

.nav-icon {
	font-size: 28px;
	margin-bottom: 8px;
}

.nav-text {
	font-size: 14px;
}

.nav-link:hover {
	color: #1f8a70;
}
</style>
