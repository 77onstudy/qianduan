<template>
	<div class="loan-page">
		<!-- 头部 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<h1 class="header-title">我的借贷</h1>
			<div class="header-right"></div>
		</header>

		<!-- 内容区 -->
		<div class="content">
			<div class="loan-card">
				<!-- 当前贷款金额显示 -->
				<div class="loan-balance-box">
					<div class="loan-balance-label">当前贷款金额（元）</div>
					<div class="loan-balance-value">{{ formattedLoanBalance }}</div>
				</div>

				<!-- 操作区 -->
				<div class="form-group">
					<!-- 申请贷款 -->
					<div class="row">
						<div class="row-title">申请贷款</div>
						<div class="row-body">
							<input
								type="number"
								v-model="applyAmount"
								class="loan-input"
								placeholder="请输入申请金额"
							/>
							<button class="loan-btn" @click="handleApplyLoan">
								申请
							</button>
						</div>
					</div>

					<!-- 还贷款 -->
					<div class="row">
						<div class="row-title">还贷款</div>
						<div class="row-body">
							<input
								type="number"
								v-model="repayAmount"
								class="loan-input"
								placeholder="请输入还款金额"
							/>
							<button class="loan-btn" @click="handleRepayLoan">
								还款
							</button>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'LoanPage',
	data() {
		return {
			loanBalance: 0.0,   // 当前贷款金额（已借未还）
			applyAmount: '',    // 申请贷款金额
			repayAmount: ''     // 还款金额
		};
	},
	computed: {
		formattedLoanBalance() {
			const n = Number(this.loanBalance);
			if (Number.isNaN(n)) {
				return '0.00';
			}
			return n.toFixed(2);
		}
	},
	mounted() {
		this.getLoanInfo();
	},
	methods: {
		// 获取当前贷款信息：GET /api/walletloan/loan
		// 期望结构：res.data.data.usedAmount
		getLoanInfo() {
			this.$axios
				.get('/api/walletloan/loan')
				.then(res => {
					console.log('loan 接口返回：', res.data);
					const root = res.data || {};
					const data = root.data || {};
					const usedAmount = data.usedAmount;

					if (typeof usedAmount !== 'undefined' && usedAmount !== null) {
						this.loanBalance = usedAmount;
					} else {
						console.warn('未从 /api/walletloan/loan 中解析到 usedAmount：', root);
						this.loanBalance = 0;
					}
				})
				.catch(err => {
					console.error(err);
					alert('贷款信息获取失败');
				});
		},

		// 申请贷款：POST /api/walletloan/loan，body { money }
		handleApplyLoan() {
			if (!this.applyAmount || this.applyAmount <= 0 || this.applyAmount % 1) {
				alert('请输入有效的申请金额（正整数）');
				return;
			}

			this.$axios
				.post('/api/walletloan/loan/apply', {
					money: Number(this.applyAmount)
				})
				.then(res => {
					const body = res.data || {};
					if (body.success === false) {
						alert(body.message || '申请贷款失败');
						return;
					}
					alert(body.message || '申请贷款成功');
					this.applyAmount = '';
					this.getLoanInfo(); // 刷新当前贷款金额
				})
				.catch(err => {
					console.error(err);
					alert('申请贷款失败，服务器或网络异常');
				});
		},

		// 还贷款：POST /api/walletloan/loan/repay，body { money }
		handleRepayLoan() {
			if (!this.repayAmount || this.repayAmount <= 0 || this.repayAmount % 1) {
				alert('请输入有效的还款金额（正整数）');
				return;
			}

			this.$axios
				.post('/api/walletloan/loan/repay', {
					money: Number(this.repayAmount)
				})
				.then(res => {
					const body = res.data || {};
					if (body.success === false) {
						alert(body.message || '还款失败');
						return;
					}
					alert(body.message || '还款成功');
					this.repayAmount = '';
					this.getLoanInfo(); // 刷新当前贷款金额
				})
				.catch(err => {
					console.error(err);
					alert('还款失败，服务器或网络异常');
				});
		}
	}
};
</script>


<style scoped>
.loan-page {
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

/* 借贷卡片 */
.loan-card {
	width: 100%;
	background-color: #ffffff;
	border-radius: 14px;
	box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
	padding: 28px 24px 32px;
	box-sizing: border-box;
}

/* 当前贷款金额 */
.loan-balance-box {
	background: linear-gradient(135deg, #8faca5, #6f8e88);
	border-radius: 16px;
	padding: 18px 20px;
	color: #ffffff;
	margin-bottom: 24px;
}

.loan-balance-label {
	font-size: 14px;
	opacity: 0.9;
	margin-bottom: 6px;
}

.loan-balance-value {
	font-size: 30px;
	font-weight: 600;
}

/* 操作区 */
.form-group {
	display: flex;
	flex-direction: column;
	gap: 18px;
	margin-top: 10px;
}

.row {
	border-radius: 12px;
	border: 1px solid #f0efe9;
	padding: 12px 14px;
	background-color: #fcfcfa;
}

.row-title {
	font-size: 15px;
	font-weight: 600;
	color: #33312e;
	margin-bottom: 8px;
}

.row-body {
	display: flex;
	gap: 12px;
	align-items: center;
}

/* 输入框 */
.loan-input {
	flex: 1;
	height: 48px;
	padding: 0 16px;
	border: 1px solid #e0dedb;
	border-radius: 10px;
	font-size: 15px;
	background-color: #f9f9f7;
	color: #333;
	box-sizing: border-box;
}

.loan-input:focus {
	outline: none;
	border-color: #8faca5;
	box-shadow: 0 0 0 3px rgba(143, 172, 165, 0.2);
	background-color: #ffffff;
}

/* 按钮 */
.loan-btn {
	height: 48px;
	min-width: 90px;
	border-radius: 10px;
	border: 1px solid #8faca5;
	background-color: #8faca5;
	color: #ffffff;
	font-size: 15px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loan-btn:hover {
	background-color: #789a94;
	border-color: #789a94;
	box-shadow: 0 4px 12px rgba(143, 172, 165, 0.25);
	transform: translateY(-1px);
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
	.loan-card {
		padding: 22px 18px 26px;
	}
	.loan-balance-value {
		font-size: 26px;
	}
	.row-body {
		flex-direction: column;
		align-items: stretch;
	}
	.loan-btn {
		width: 100%;
	}
}
</style>
