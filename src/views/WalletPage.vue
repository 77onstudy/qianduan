<template>
	<div class="wallet-page">
		<!-- 头部 -->
		<header class="header">
			<div class="back-box" @click="$router.go(-1)">
				<span class="back-symbol">&lt;</span>
			</div>
			<h1 class="header-title">我的钱包</h1>
			<div class="header-right"></div>
		</header>

		<!-- 内容区 -->
		<div class="content">
			<div class="wallet-card">
				<!-- 余额显示 -->
				<div class="balance-box">
					<div class="balance-label">当前余额（元）</div>
					<!-- 用计算属性，避免 balance 为 null / 字符串时报错 -->
					<div class="balance-value">{{ this.balance}}</div>
				</div>

				<!-- 按钮区：四个操作按钮 -->
				<div class="btn-group">
					<!-- 充值：输入框 + 按钮 -->
					<div class="recharge-row">
						<input
							type="number"
							v-model="rechargeAmount"
							class="recharge-input"
							placeholder="请输入充值金额"
						/>
						<button class="wallet-btn recharge-btn" @click="handleRecharge">
							充值
						</button>
					</div>

					<div class="recharge-row">
						<input
							type="number"
							v-model="withdrawAmount"
							class="recharge-input"
							placeholder="请输入提现金额"
						/>
						<button class="wallet-btn recharge-btn" @click="handleWithdraw">
							提现
						</button>
					</div>
					<button class="wallet-btn" @click="handleViewFlow">
						<span>查看流水</span>
					</button>
					<button class="wallet-btn" @click="handleLoan">
						<span>借贷</span>
					</button>
				</div>
			</div>
		</div>

		<!-- <NavFooter /> -->
	</div>
</template>

<script>
// import NavFooter from '@/components/NavFooter.vue';

export default {
	name: 'WalletPage',
	// components: { NavFooter },
	data() {
		return {
			balance: 0.0,
			rechargeAmount: '',
			withdrawAmount: ""
		};
	},
	computed: {
		// 避免 balance 不是数字时报错：统一转成数字再 toFixed
		formattedBalance() {
			const n = Number(this.balance);
			if (Number.isNaN(n)) {
				return '0.00';
			}
			return n.toFixed(2);
		}
	},
	methods: {
		getWallet() {
			this.$axios
				.get('/api/wallet')
				.then(res => {
					if (res ) {
						this.balance = res.data.data.balance;
					} else {
						console.warn('钱包接口返回不包含 balance 字段：', res.data);
					}
				})
				.catch(err => {
					console.error(err);
					alert('钱包信息获取失败');
				});
		},

		handleRecharge() {
			if (!this.rechargeAmount || this.rechargeAmount <= 0||this.rechargeAmount%1) {
				alert("请输入有效的充值金额");
				return;
			}

			this.$axios.patch('/api/wallet/recharge', {
				money: this.rechargeAmount  
			})
			.then(res => {
				if(res){
				alert("充值成功");}

				this.getWallet();

				this.rechargeAmount = "";
			})
			.catch(err => {
				console.error(err);
				alert("充值失败");
			});
		},
		handleWithdraw() {
			if (!this.withdrawAmount || this.withdrawAmount <= 0 || this.withdrawAmount % 1) {
				alert("请输入有效的提现金额");
				return;
			}

			this.$axios.patch('/api/wallet/withdraw', {
				money: this.withdrawAmount
			})
				.then(res => {
					
					alert("提现成功"+res.data.data.money+"元");

					this.getWallet();       
					this.withdrawAmount = ""; 
				})
				.catch(err => {
					console.error(err);
					alert("提现失败");
				});
		},
		// 查看流水
		handleViewFlow() {
			this.$router.push({ name: 'TradeStreamPage' });
		},
		// 借贷
		handleLoan() {
			// TODO: 在这里实现借贷逻辑
			console.log('点击借贷');
		}
	},
	mounted() {
		this.getWallet();
	}
};
</script>

<style scoped>
.wallet-page {
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

/* 钱包卡片 */
.wallet-card {
	width: 100%;
	background-color: #ffffff;
	border-radius: 14px;
	box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
	padding: 28px 24px 32px;
	box-sizing: border-box;
}

/* 余额显示 */
.balance-box {
	background: linear-gradient(135deg, #8faca5, #6f8e88);
	border-radius: 16px;
	padding: 18px 20px;
	color: #ffffff;
	margin-bottom: 24px;
}

.balance-label {
	font-size: 14px;
	opacity: 0.9;
	margin-bottom: 6px;
}

.balance-value {
	font-size: 30px;
	font-weight: 600;
}

/* 按钮组 */
.btn-group {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 14px;
	margin-top: 10px;
}

/* 充值行：占两列，里面再用 flex 布局 */
.recharge-row {
	display: flex;
	gap: 12px;
	grid-column: span 2;
}

/* 输入框 */
.recharge-input {
	flex: 1;
	height: 54px;
	padding: 0 16px;
	border: 1px solid #e0dedb;
	border-radius: 12px;
	font-size: 16px;
	background-color: #f9f9f7;
	color: #333;
	box-sizing: border-box;
}

.recharge-input:focus {
	outline: none;
	border-color: #8faca5;
	box-shadow: 0 0 0 3px rgba(143, 172, 165, 0.2);
	background-color: #ffffff;
}

/* 按钮 */
.wallet-btn {
	height: 54px;
	border-radius: 12px;
	border: 1px solid #e0dedb;
	background-color: #f9f9f7;
	font-size: 16px;
	font-weight: 500;
	color: #33312e;
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.wallet-btn:hover {
	background-color: #f8f5ea;
	color: #8faca5;
	border-color: #8faca5;
	box-shadow: 0 4px 12px rgba(143, 172, 165, 0.15);
	transform: translateY(-1px);
}

/* 充值按钮微调 */
.recharge-btn {
	min-width: 100px;
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

	.wallet-card {
		padding: 22px 18px 26px;
	}

	.balance-value {
		font-size: 26px;
	}

	.wallet-btn {
		height: 50px;
		font-size: 15px;
	}

	.recharge-input {
		height: 50px;
		font-size: 15px;
	}
}
</style>
