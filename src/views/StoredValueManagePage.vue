<template>
	<div class="sv-wrapper">
		<header class="sv-header">
			<h2>储值活动与钱包规则配置</h2>
			<div class="actions">
				<!-- 返回按钮（可选） -->
				<button class="ghost" @click="$router.go(-1)">
					返回
				</button>
				<button @click="loadConfig" :disabled="loading">
					{{ loading ? '刷新中...' : '重新加载' }}
				</button>
			</div>
		</header>

		<section class="card" v-if="loaded">
			<h3>系统配置参数</h3>
			<p class="desc">
				以下配置会影响：会员资格、储值赠送、提现手续费、贷款额度与利息、积分规则等。修改后请谨慎保存。
			</p>

			<div class="form-grid">
				<label>
					订单限制时间
					<input
						type="number"
						v-model.number="form.limitTime"
						placeholder="如：1 或时间戳"
					/>
				</label>

				<label>
					VIP 门槛金额
					<input
						type="number"
						step="0.01"
						v-model.number="form.vip"
						placeholder="如：2000.00"
					/>
				</label>

				<label>
					VIP 透支额度上限
					<input
						type="number"
						step="0.01"
						v-model.number="form.vipOverdraftLimit"
						placeholder="如：100000.00"
					/>
				</label>

				<label>
					充值赠送金额
					<input
						type="number"
						step="0.01"
						v-model.number="form.rechargeReward"
						placeholder="如：4000.00"
					/>
				</label>

				<label>
					充值赠送透支额度
					<input
						type="number"
						step="0.01"
						v-model.number="form.rechargeRewardOverdraft"
						placeholder="如：10000.00"
					/>
				</label>

				<label>
					提现手续费比例
					<input
						type="number"
						step="0.01"
						v-model.number="form.withdrawFee"
						placeholder="如：0.10"
					/>
				</label>

				<label>
					默认贷款额度
					<input
						type="number"
						step="0.01"
						v-model.number="form.defaultLoanLimit"
						placeholder="如：100000.00"
					/>
				</label>

				<label>
					贷款日利率
					<input
						type="number"
						step="0.01"
						v-model.number="form.loanInterestRate"
						placeholder="如：0.05"
					/>
				</label>

				<label>
					贷款免息天数
					<input
						type="number"
						step="1"
						v-model.number="form.loanFreeDays"
						placeholder="如：30"
					/>
				</label>

				<label>
					单笔最小贷款金额
					<input
						type="number"
						step="0.01"
						v-model.number="form.minLoanAmount"
						placeholder="如：100.00"
					/>
				</label>

				<label>
					单笔最大贷款金额
					<input
						type="number"
						step="0.01"
						v-model.number="form.maxLoanAmount"
						placeholder="如：10000.00"
					/>
				</label>

				<!-- 新增积分相关字段 -->
				<label>
					积分可用时长(天)
					<input
						type="number"
						step="1"
						v-model.number="form.life"
						placeholder="如：365"
					/>
				</label>

				<label>
					积分奖励门槛(消费金额)
					<input
						type="number"
						step="0.01"
						v-model.number="form.pointsRewardOverdraft"
						placeholder="如：100.00"
					/>
				</label>

				<label>
					积分奖励数量
					<input
						type="number"
						step="1"
						v-model.number="form.pointsReward"
						placeholder="如：10"
					/>
				</label>

				<label>
					积分兑换比例(花多少积分)
					<input
						type="number"
						step="1"
						v-model.number="form.pointsPerUnit"
						placeholder="如：100"
					/>
				</label>

				<label>
					现金兑换比例(兑换多少钱)
					<input
						type="number"
						step="0.01"
						v-model.number="form.cashPerPoint"
						placeholder="如：1.00"
					/>
				</label>
			</div>

			<div class="form-actions">
				<button @click="save" :disabled="saving">
					{{ saving ? '保存中...' : '保存配置' }}
				</button>
				<button class="ghost" @click="resetForm" :disabled="saving">
					恢复为服务器原值
				</button>
			</div>

			<div v-if="error" class="error">
				{{ error }}
			</div>
			<div v-if="success" class="success">
				{{ success }}
			</div>
		</section>

		<section class="card" v-else>
			<div class="loading">正在加载配置...</div>
			<div v-if="error" class="error" style="margin-top:8px;">
				{{ error }}
			</div>
		</section>
	</div>
</template>

<script>
export default {
	name: 'StoredValueManagePage',

	data() {
		return {
			API_GET: '/api/system-config',
			API_UPDATE: '/api/system-config',

			loading: false,
			saving: false,
			loaded: false,

			error: '',
			success: '',

			rawConfig: null, // 原始从后端拿到的完整 data
			form: {
				id: null,
				limitTime: null,
				vip: null,
				vipOverdraftLimit: null,
				rechargeReward: null,
				rechargeRewardOverdraft: null,
				withdrawFee: null,
				defaultLoanLimit: null,
				loanInterestRate: null,
				loanFreeDays: null,
				minLoanAmount: null,
				maxLoanAmount: null,
				// 新增字段
				life: null,
				pointsRewardOverdraft: null,
				pointsReward: null,
				pointsPerUnit: null,
				cashPerPoint: null
			}
		};
	},

	mounted() {
		this.loadConfig();
	},

	methods: {
		unwrap(res) {
			// 兼容 { success, code, data } 或直接 data
			return res?.data?.data ?? res?.data ?? null;
		},

		loadConfig() {
			this.loading = true;
			this.error = '';
			this.success = '';

			this.$axios
				.get(this.API_GET)
				.then(res => {
					const cfg = this.unwrap(res);
					if (!cfg || typeof cfg !== 'object') {
						this.error = '未获取到有效配置数据';
						this.loaded = false;
						return;
					}
					this.rawConfig = { ...cfg };

					this.form = {
						id: cfg.id ?? null,
						limitTime: cfg.limitTime ?? null,
						vip: cfg.vip ?? null,
						vipOverdraftLimit: cfg.vipOverdraftLimit ?? null,
						rechargeReward: cfg.rechargeReward ?? null,
						rechargeRewardOverdraft: cfg.rechargeRewardOverdraft ?? null,
						withdrawFee: cfg.withdrawFee ?? null,
						defaultLoanLimit: cfg.defaultLoanLimit ?? null,
						loanInterestRate: cfg.loanInterestRate ?? null,
						loanFreeDays: cfg.loanFreeDays ?? null,
						minLoanAmount: cfg.minLoanAmount ?? null,
						maxLoanAmount: cfg.maxLoanAmount ?? null,
						// 新增字段
						life: cfg.life ?? null,
						pointsRewardOverdraft: cfg.pointsRewardOverdraft ?? null,
						pointsReward: cfg.pointsReward ?? null,
						pointsPerUnit: cfg.pointsPerUnit ?? null,
						cashPerPoint: cfg.cashPerPoint ?? null
					};

					this.loaded = true;
				})
				.catch(err => {
					console.error(err);
					this.error =
						err?.response?.data?.message ||
						err?.response?.data?.error ||
						err.message ||
						'加载系统配置失败';
					this.loaded = false;
				})
				.finally(() => {
					this.loading = false;
				});
		},

		resetForm() {
			if (!this.rawConfig) return;
			this.error = '';
			this.success = '';
			const cfg = this.rawConfig;
			this.form = {
				id: cfg.id ?? null,
				limitTime: cfg.limitTime ?? null,
				vip: cfg.vip ?? null,
				vipOverdraftLimit: cfg.vipOverdraftLimit ?? null,
				rechargeReward: cfg.rechargeReward ?? null,
				rechargeRewardOverdraft: cfg.rechargeRewardOverdraft ?? null,
				withdrawFee: cfg.withdrawFee ?? null,
				defaultLoanLimit: cfg.defaultLoanLimit ?? null,
				loanInterestRate: cfg.loanInterestRate ?? null,
				loanFreeDays: cfg.loanFreeDays ?? null,
				minLoanAmount: cfg.minLoanAmount ?? null,
				maxLoanAmount: cfg.maxLoanAmount ?? null,
				// 新增字段
				life: cfg.life ?? null,
				pointsRewardOverdraft: cfg.pointsRewardOverdraft ?? null,
				pointsReward: cfg.pointsReward ?? null,
				pointsPerUnit: cfg.pointsPerUnit ?? null,
				cashPerPoint: cfg.cashPerPoint ?? null
			};
		},

		buildPayload() {
			// 按你给的修改示例结构构造 body
			return {
				id: this.form.id,
				limitTime: this.form.limitTime,
				vip: this.form.vip,
				vipOverdraftLimit: this.form.vipOverdraftLimit,
				rechargeReward: this.form.rechargeReward,
				rechargeRewardOverdraft: this.form.rechargeRewardOverdraft,
				withdrawFee: this.form.withdrawFee,
				defaultLoanLimit: this.form.defaultLoanLimit,
				loanInterestRate: this.form.loanInterestRate,
				loanFreeDays: this.form.loanFreeDays,
				minLoanAmount: this.form.minLoanAmount,
				maxLoanAmount: this.form.maxLoanAmount,
				// 新增字段
				life: this.form.life,
				pointsRewardOverdraft: this.form.pointsRewardOverdraft,
				pointsReward: this.form.pointsReward,
				pointsPerUnit: this.form.pointsPerUnit,
				cashPerPoint: this.form.cashPerPoint
			};
		},

		save() {
			this.error = '';
			this.success = '';

			if (!this.form.id) {
				this.error = '配置 ID 为空，无法保存，请先检查 /api/system-config 返回值';
				return;
			}

			const payload = this.buildPayload();
			this.saving = true;

			this.$axios
				.patch(this.API_UPDATE, payload, {
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json'
					}
				})
				.then(res => {
					// 成功后，用返回的 data 覆盖本地
					const updated = this.unwrap(res);
					if (updated && typeof updated === 'object') {
						this.rawConfig = { ...updated };
						this.resetForm();
					}
					this.success = '保存成功';
				})
				.catch(err => {
					console.error(err);
					this.error =
						err?.response?.data?.message ||
						err?.response?.data?.error ||
						err.message ||
						'保存配置失败';
				})
				.finally(() => {
					this.saving = false;
				});
		}
	}
};
</script>

<style scoped>
.sv-wrapper {
	max-width: 960px;
	margin: 0 auto;
	padding: 16px;
	font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.sv-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.sv-header h2 {
	font-size: 20px;
	font-weight: 600;
	color: #1f2933;
}

.actions {
	display: flex;
	gap: 8px;
	align-items: center;
}

.card {
	background: #ffffff;
	border-radius: 14px;
	box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
	padding: 16px 18px 18px;
	margin-bottom: 16px;
}

.card h3 {
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 6px;
}

.desc {
	font-size: 13px;
	color: #6b7280;
	margin-bottom: 12px;
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px 16px;
}

.form-grid label {
	display: grid;
	gap: 4px;
	font-size: 13px;
	color: #374151;
}

.form-grid input {
	padding: 8px 10px;
	border-radius: 8px;
	border: 1px solid #d1d5db;
	font-size: 14px;
	outline: none;
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-grid input:focus {
	border-color: #0ea5e9;
	box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.35);
}

.form-actions {
	margin-top: 14px;
	display: flex;
	gap: 10px;
}

button {
	padding: 8px 14px;
	border-radius: 10px;
	border: none;
	background: #0ea5e9;
	color: #ffffff;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s ease;
}

button:hover:enabled {
	opacity: 0.96;
	transform: translateY(-1px);
}

button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

button.ghost {
	background: #eef2f7;
	color: #374151;
}

.error {
	color: #ef4444;
	font-size: 13px;
	margin-top: 8px;
}

.success {
	color: #16a34a;
	font-size: 13px;
	margin-top: 8px;
}

.loading {
	text-align: center;
	padding: 18px 0;
	color: #6b7280;
}

/* 响应式布局 */
@media (min-width: 1024px) {
	.form-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}

@media (max-width: 1023px) and (min-width: 641px) {
	.form-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.form-grid {
		grid-template-columns: 1fr;
	}
}

/* 小屏适配 */
@media (max-width: 640px) {
	.sv-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}
	
	.actions {
		width: 100%;
		justify-content: space-between;
	}
}
</style>