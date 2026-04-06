<template>
	<div class="form-card">
		<h2>✏️ 编辑食品</h2>

		<form @submit.prevent="submitForm">
			<div class="form-group">
				<label>食品名称</label>
				<input v-model.trim="form.foodName" required />
			</div>

			<div class="form-group">
				<label>食品介绍</label>
				<input v-model.trim="form.foodExplain" required />
			</div>

			<div class="form-group">
				<label>食品价格</label>
				<input v-model.number="form.foodPrice" type="number" min="0" step="0.01" required />
			</div>

			<div class="form-group">
				<label>备注</label>
				<textarea v-model.trim="form.remarks" rows="2" />
			</div>

			<div class="form-group">
				<label>食品图片</label>
				<input type="file" @change="handleImageUpload" accept="image/*" />
				<div v-if="form.foodImg" class="preview">
					<img :src="form.foodImg" alt="预览" />
				</div>
			</div>

			<div class="form-buttons">
				<button type="submit" class="btn save" :disabled="saving || loading">
					{{ saving ? '保存中…' : '保存修改' }}
				</button>
				<button type="button" class="btn cancel" @click="resetForm" :disabled="saving || loading">
					清空表单
				</button>
			</div>
		</form>
	</div>
</template>

<script>
export default {
	name: 'FoodEdit',
	data() {
		return {
			loading: false,
			saving: false,
			foodId: null,
			businessId: null,
			original: {
				id: null,
				foodName: '',
				foodExplain: '',
				foodImg: '',
				foodPrice: null,
				remarks: '',
				business: { id: null }
			},
			form: {
				id: null,
				foodName: '',
				foodExplain: '',
				foodImg: '',
				foodPrice: null,
				remarks: '',
				business: { id: null }
			}
		};
	},
	created() {
		const { foodId, businessId } = this.$route.query;
		this.foodId = foodId ? Number(foodId) : null;
		this.businessId = businessId ? Number(businessId) : null;
		this.fetchFood();
	},
	methods: {
		apiOk(res) {
			// 兼容：success=true 或 code==="OK" 或 code===0
			return res && res.data && (res.data.success === true || res.data.code === 'OK' || res.data.code === 0);
		},

		mapFood(f) {
			return {
				id: f.id,
				foodName: f.foodName ?? '',
				foodExplain: f.foodExplain ?? '',
				foodImg: f.foodImg ?? '',
				foodPrice: typeof f.foodPrice === 'number' ? f.foodPrice : (f.foodPrice ? Number(f.foodPrice) : null),
				remarks: f.remarks ?? '',
				business: { id: f?.business?.id ?? this.businessId ?? null }
			};
		},

		async fetchFood() {
			if (!this.foodId) {
				alert('缺少 foodId');
				return;
			}
			this.loading = true;
			try {
				const res = await this.$axios.get(`/api/foods/${this.foodId}`);
				if (this.apiOk(res) && res.data.data) {
					const mapped = this.mapFood(res.data.data);
					this.original = JSON.parse(JSON.stringify(mapped));
					this.form = JSON.parse(JSON.stringify(mapped));
					// 路由有 businessId 时覆盖（以路由为准）
					if (this.businessId) {
						this.form.business.id = this.businessId;
					}
				} else {
					alert(res?.data?.message || '获取食品信息失败');
				}
			} catch (e) {
				console.error(e);
				alert('网络错误：获取食品信息失败');
			} finally {
				this.loading = false;
			}
		},

		buildPatchPayload() {
			const payload = {};
			const keys = ['foodName', 'foodExplain', 'foodImg', 'foodPrice', 'remarks'];
			keys.forEach(k => {
				if (this.form[k] !== this.original[k]) {
					payload[k] = this.form[k];
				}
			});
			const currentBizId = this.form?.business?.id ?? null;
			const originalBizId = this.original?.business?.id ?? null;
			if (currentBizId && currentBizId !== originalBizId) {
				payload.business = { id: currentBizId };
			}
			return payload;
		},

		async submitForm() {
			if (!this.form.foodName?.trim()) {
				alert('请填写食品名称');
				return;
			}
			if (!this.form.foodExplain?.trim()) {
				alert('请填写食品介绍');
				return;
			}
			if (this.form.foodPrice == null || isNaN(this.form.foodPrice) || Number(this.form.foodPrice) < 0) {
				alert('请填写合法的食品价格（>= 0）');
				return;
			}
			if (!this.foodId) {
				alert('缺少 foodId');
				return;
			}
			const payload = this.buildPatchPayload();
			if (Object.keys(payload).length === 0) {
				alert('没有任何修改内容');
				return;
			}
			this.saving = true;
			try {
				const res = await this.$axios.patch(
					`/api/foods/${this.foodId}`,
					payload,
					{ headers: { 'Content-Type': 'application/json' } }
				);
				if (this.apiOk(res)) {
					alert('修改成功！');
					this.$router.push({ path: '/goodsManage', query: { businessId: this.form?.business?.id || this.businessId } });
				} else {
					alert(res?.data?.message || '修改失败');
				}
			} catch (e) {
				console.error(e);
				alert('网络错误：修改失败');
			} finally {
				this.saving = false;
			}
		},

		handleImageUpload(event) {
			const file = event.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = e => {
				this.form.foodImg = e.target.result; // 支持 base64 DataURL（与你的响应保持一致）
			};
			reader.readAsDataURL(file);
		},

		resetForm() {
			this.form = {
				id: this.original.id,
				foodName: '',
				foodExplain: '',
				foodImg: '',
				foodPrice: null,
				remarks: '',
				business: { id: this.businessId || this.original?.business?.id || null }
			};
		}
	}
};
</script>

<style scoped>
.form-card {
	max-width: 600px;
	margin: auto;
	padding: 24px;
	background: #fff;
	border-radius: 16px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	font-family: 'Segoe UI', sans-serif;
}
h2 {
	text-align: center;
	color: #333;
	margin-bottom: 20px;
}
.form-group {
	margin-bottom: 16px;
	display: flex;
	flex-direction: column;
}
label {
	font-weight: bold;
	margin-bottom: 6px;
	color: #555;
}
input,
textarea {
	padding: 10px 12px;
	border: 1px solid #ccc;
	border-radius: 8px;
	font-size: 14px;
	transition: border-color 0.2s;
}
input:focus,
textarea:focus {
	border-color: #409eff;
	outline: none;
}
.preview img {
	margin-top: 12px;
	max-width: 160px;
	border-radius: 10px;
	box-shadow: 0 1px 6px rgba(0,0,0,0.2);
}
.form-buttons {
	display: flex;
	justify-content: space-between;
	margin-top: 20px;
}
.btn {
	padding: 10px 18px;
	border: none;
	border-radius: 8px;
	font-weight: bold;
	cursor: pointer;
	font-size: 14px;
	transition: background-color 0.2s;
}
.btn.save {
	background-color: #007bff;
	color: white;
}
.btn.cancel {
	background-color: #6c757d;
	color: white;
}
.btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>
