<template>
  <div class="form-card">
    <h2>➕ 添加食品</h2>

    <form v-if="loaded" @submit.prevent="submitForm">
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
        <input v-model.number="form.foodPrice" type="number" step="0.01" required />
      </div>

      <div class="form-group">
        <label>备注</label>
        <textarea v-model.trim="form.remarks" rows="2" />
      </div>

      <div class="form-group">
        <label>食品图片</label>
        <input type="file" @change="handleImageUpload" accept="image/*" required />
        <div v-if="form.foodImg" class="preview">
          <img :src="form.foodImg" alt="预览" />
        </div>
      </div>

      <div class="form-buttons">
        <button type="submit" class="btn add" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交添加' }}
        </button>
        <button type="button" class="btn cancel" @click="resetForm" :disabled="submitting">清空表单</button>
      </div>
    </form>

    <div v-else style="text-align:center;color:#666;padding:12px;">加载中...</div>
  </div>
</template>

<script>
export default {
  name: 'AddFood',
  data() {
    return {
      loaded: false,
      submitting: false,
      businessId: null,
      businessFull: null, // 从 /api/businesses/{id} 拿到的完整对象
      form: {
        foodName: '',
        foodExplain: '',
        foodImg: '',
        foodPrice: '',
        remarks: ''
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    // 统一解包，兼容 { data: { data: xxx } } 或 { data: xxx }
    unwrap(res) {
      return res?.data?.data ?? res?.data ?? null;
    },
    buildFullFoodPayload() {
    // 这里假设 this.businessFull 是通过 /api/businesses/{id} 拿到的完整对象
    return {
      id: null,
      createTime: null,
      updateTime: null,
      creator: null,
      updater: null,
      deleted: null,              // 未知可为空

      foodName: this.form.foodName ?? null,
      foodExplain: this.form.foodExplain ?? null,
      foodImg: this.form.foodImg ?? null,
      foodPrice: this.form.foodPrice != null ? Number(this.form.foodPrice) : null,

      // 嵌套完整的 business（直接用后端返回的 data.data）
      business: this.businessFull ?? null,

      remarks: this.form.remarks ?? null
    };
  },


    async init() {
      try {
        // 1) 通过 /api/user 拿 data.id
        const userWrap = await this.$axios.get('/api/user');
        const user = this.unwrap(userWrap);
        if (!user?.id) {
          alert('无法获取商家ID，请登录后重试');
          this.loaded = true;
          return;
        }
        this.businessId = Number(user.id);

        // 2) 拉取 business 完整实体
        const bizWrap = await this.$axios.get(`/api/businesses/${encodeURIComponent(this.businessId)}`);
        const business = this.unwrap(bizWrap);
        if (!business || !business.id) {
          alert('未获取到商家信息');
          this.loaded = true;
          return;
        }
        this.businessFull = business;

        this.loaded = true;
      } catch (e) {
        console.error('初始化失败：', e);
        alert('加载失败，请稍后重试');
        this.loaded = true;
      }
    },

    handleImageUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => { this.form.foodImg = e.target.result; };
      reader.readAsDataURL(file);
    },

    validMoney(v) {
      return /^\d+(\.\d{1,2})?$/.test(String(v));
    },

    async submitForm() {
    // 基础校验：按需保留（也可去掉，完全交由后端校验）
          if (!this.form.foodName || !this.form.foodExplain) {
            alert('请填写完整的名称与介绍'); return;
          }
          if (!this.validMoney(this.form.foodPrice)) {
            alert('食品价格格式不正确，最多两位小数'); return;
          }
          if (!this.form.foodImg) {
            alert('请上传食品图片'); return;
          }
          if (!this.businessFull?.id) {
            alert('商家信息缺失，请刷新后重试'); return;
          }

          const payload = this.buildFullFoodPayload();

          try {
            this.submitting = true;
            const resWrap = await this.$axios.post('/api/foods', payload, {
              headers: { 'Content-Type': 'application/json' }
            });

            const created = this.unwrap(resWrap);
            console.log(created);

            alert('添加成功！');
            this.$router.push({ path: '/goodsManage', query: { businessId: this.businessId } });
          } catch (err) {
            console.error('添加失败：', err);
            alert('添加失败：' + (err.response?.data?.message || err.message));
          } finally {
            this.submitting = false;
          }
        }
      },


    resetForm() {
      this.form = {
        foodName: '',
        foodExplain: '',
        foodImg: '',
        foodPrice: '',
        remarks: ''
      };
    }
  }

</script>

<style scoped>
.form-card {
  max-width: 600px;
  margin: auto;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', sans-serif;
}
h2 { text-align: center; color: #333; margin-bottom: 20px; }
.form-group { margin-bottom: 16px; display: flex; flex-direction: column; }
label { font-weight: bold; margin-bottom: 6px; color: #555; }
input, textarea {
  padding: 10px 12px; border: 1px solid #ccc; border-radius: 8px;
  font-size: 14px; transition: border-color .2s;
}
input:focus, textarea:focus { border-color: #409eff; outline: none; }
.preview img {
  margin-top: 12px; max-width: 160px; border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.2);
}
.form-buttons { display: flex; justify-content: space-between; margin-top: 20px; }
.btn { padding: 10px 18px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: background-color .2s; }
.btn.add { background-color: #28a745; color: white; }
.btn.cancel { background-color: #6c757d; color: white; }
</style>
