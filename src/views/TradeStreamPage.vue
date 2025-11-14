<template>
	<div class="stream-page">
		<!-- 头部 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<h1 class="header-title">交易流水</h1>
			<div class="header-right"></div>
		</header>

		<!-- 内容区 -->
		<div class="content">
			<div class="card">
				<div v-if="loading" class="tip-text">正在加载交易流水...</div>
				<div v-else-if="error" class="tip-text error-text">{{ error }}</div>
				<div v-else-if="transactions.length === 0" class="tip-text">
					暂无交易记录
				</div>

				<!-- 交易列表 -->
				<div v-else class="stream-list">
					<div
						class="stream-item"
						v-for="(item, index) in transactions"
						:key="item.id || index"
					>
						<div class="stream-main">
							<div class="stream-title">
								{{ formatType(item.transactionType) }}
							</div>
							<div
								class="stream-amount"
								:class="{
									income: isIncome(item.symbol),
									expense: !isIncome(item.symbol)
								}"
							>
								{{ formatAmount(item.amount, item.transactionType) }}
							</div>
						</div>

						<div class="stream-sub">
							<div class="sub-row">
								<span class="label">时间：</span>
								<span class="value">{{ formatTime(item.transactionTime) }}</span>
							</div>
							<div class="sub-row" v-if="item.order && item.order.business">
								<span class="label">商家：</span>
								<span class="value">{{ item.order.business.businessName }}</span>
							</div>
							<div class="sub-row" v-if="item.order && item.order.orderTotal">
								<span class="label">订单金额：</span>
								<span class="value">￥{{ item.order.orderTotal }}</span>
							</div>
							<div class="sub-row" v-if="item.remark">
								<span class="label">备注：</span>
								<span class="value">{{ item.remark }}</span>
							</div>
							<div class="sub-row">
								<span class="label">状态：</span>
								<span class="value">{{ formatStatus(item.status) }}</span>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'TradeStreamPage',
	data() {
		return {
			loading: false,
			error: '',
			transactions: [] // 交易流水数组
		};
	},
	mounted() {
		this.loadStreams();
	},
	methods: {
		// 请求 /api/trade/stream
		loadStreams() {
			this.loading = true;
			this.error = '';

			this.$axios
				.get('/api/trade/stream')
				.then(res => {
					this.loading = false;

					// 预期结构：res.data.data.WalletTrascation
					const root = res.data;


					if (!root || !root.success) {
						this.error = root && root.message ? root.message : '查询失败';
						return;
					}

					const w = root.data;

					// 如果后端给的是单个对象，就包成数组
					if (w) {
						if (Array.isArray(w)) {
							this.transactions = w;
						} else {
							this.transactions = [w];
						}
					} else {
						this.transactions = [];
					}
				})
				.catch(err => {
					console.error(err);
					this.loading = false;
					this.error = '交易流水获取失败';
				});
		},

		formatAmount(amount, type) {
			const n = Number(amount) || 0;
			const sign = this.isIncome(type) ? '+' : '-';
			return sign + n.toFixed(2);
		},

		isIncome(type) {
			return 2-type;
		},

		// 类型中文说明
		formatType(type) {
			switch (type) {
				case 1:
					return '充值';
				case 2:
					return '提现';
				case 3:
					return '钱包支付';
				default:
					return '非钱包支付';
			}
		},

		// 状态中文说明（按你后端约定可自行调整）
		formatStatus(status) {
			switch (status) {
				case 0:
					return '处理中';
				case 1:
					return '成功';
				case 2:
					return '失败';
				default:
					return '未知';
			}
		},

		// 时间格式化（简单切一下）
		formatTime(t) {
			if (!t) return '-';
			if (t.length >= 19 && t.includes('T')) {
				return t.substring(0, 19).replace('T', ' ');
			}
			return t;
		}
	}
};
</script>

<style scoped>
.stream-page {
	width: 100%;
	min-height: 100vh;
	background-color: #fcfcfa;
	box-sizing: border-box;
	padding-bottom: 90px;
	font-family: 'Segoe UI', 'Inter', sans-serif;
}

/* 头部 */
.header {
	width: 100%;
	height: 80px;
	background-color: #ffffff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
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
	width: 44px;
	height: 44px;
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
	font-size: 22px;
	color: #5d5a56;
	font-weight: 600;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 22px;
	font-weight: 600;
	color: #33312e;
	margin: 0;
}

.header-right {
	width: 44px;
}

/* 内容区 */
.content {
	width: 100%;
	max-width: 880px;
	margin: 100px auto 40px;
	padding: 0 24px;
	box-sizing: border-box;
}

.card {
	width: 100%;
	background-color: #ffffff;
	border-radius: 14px;
	box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
	padding: 24px 20px 26px;
	box-sizing: border-box;
}

/* 提示文字 */
.tip-text {
	text-align: center;
	color: #66635d;
	font-size: 15px;
	padding: 24px 0;
}
.error-text {
	color: #c0392b;
}

/* 流水列表 */
.stream-list {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.stream-item {
	border-radius: 10px;
	border: 1px solid #f0efe9;
	padding: 12px 14px;
	box-sizing: border-box;
	background-color: #fcfcfa;
}

/* 上半行：类型 + 金额 */
.stream-main {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
}

.stream-title {
	font-size: 16px;
	font-weight: 600;
	color: #33312e;
}

.stream-amount {
	font-size: 18px;
	font-weight: 600;
}
.stream-amount.income {
	color: #27ae60;
}
.stream-amount.expense {
	color: #c0392b;
}

/* 下半部分：详细信息 */
.stream-sub {
	font-size: 13px;
	color: #66635d;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sub-row {
	display: flex;
	flex-wrap: wrap;
}

.label {
	color: #a09c97;
	min-width: 60px;
}

.value {
	color: #55524e;
}

/* 小屏适配 */
@media (max-width: 767px) {
	.header {
		height: 70px;
	}
	.content {
		margin: 90px auto 30px;
		padding: 0 16px;
	}
	.card {
		padding: 20px 16px 22px;
	}
	.stream-item {
		padding: 10px 10px;
	}
}
</style>
