<template>
  <div class="seller-page">
    <h2>商家信息管理</h2>
    <p v-if="businessFull.id != null" class="hint">当前店铺 ID：{{ businessFull.id }}</p>

    <form v-if="loaded" @submit.prevent="submitForm">
      <div class="form-item">
        <label>商家名称</label>
        <input v-model.trim="businessForm.businessName" />
      </div>

      <div class="form-item">
        <label>商家地址</label>
        <input v-model.trim="businessForm.businessAddress" />
      </div>

      <div class="form-item">
        <label>商家介绍</label>
        <input v-model.trim="businessForm.businessExplain" />
      </div>

      <div class="form-item">
        <label>点餐分类</label>
        <select v-model.number="businessForm.orderTypeId">
          <option v-for="t in orderTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-item">
          <label>起送费</label>
          <input type="number" step="0.01" v-model.number="businessForm.startPrice" />
        </div>
        <div class="form-item">
          <label>配送费</label>
          <input type="number" step="0.01" v-model.number="businessForm.deliveryPrice" />
        </div>
      </div>

      <div class="form-item">
        <label>备注</label>
        <input v-model.trim="businessForm.remarks" />
      </div>

      <div class="form-item">
        <label>商家图片</label>
        <input type="file" accept="image/*" @change="handleImageUpload" />
        <div class="img-box">
          <img v-if="businessForm.businessImg" :src="businessForm.businessImg" alt="预览" />
          <div v-else class="img-empty">暂无图片</div>
        </div>
      </div>

      <div class="button-group">
        <button type="submit" class="primary">提交</button>
        <button type="button" class="secondary" @click="toFood">食品管理</button>
      </div>
    </form>

    <div v-else class="loading">正在加载...</div>
  </div>
</template>

<script>
export default {
  name: 'SellerPage',
  data() {
    return {
      loaded: false,
      orderTypes: [
        { id: 1, name: '美食' }, { id: 2, name: '早餐' }, { id: 3, name: '跑腿代购' },
        { id: 4, name: '汉堡披萨' }, { id: 5, name: '甜品饮品' }, { id: 6, name: '速食简餐' },
        { id: 7, name: '地方小吃' }, { id: 8, name: '米粉面馆' }, { id: 9, name: '包子粥铺' },
        { id: 10, name: '炸鸡炸串' }
      ],
      // 完整实体（保持最新一份原样，提交时用它来补全不可编辑字段）
      businessFull: {
        id: null,
        createTime: null,
        updateTime: null,
        creator: null,
        updater: null,
        deleted: false,
        businessName: '',
        businessOwner: null,
        businessAddress: '',
        businessExplain: '',
        businessImg: '',
        orderTypeId: 1,
        startPrice: 0,
        deliveryPrice: 0,
        remarks: ''
      },
      // 只放可编辑字段
      businessForm: {
        businessName: '',
        businessAddress: '',
        businessExplain: '',
        businessImg: '',
        orderTypeId: 1,
        startPrice: 0,
        deliveryPrice: 0,
        remarks: ''
      }
    };
  },
  methods: {
    unwrap(res) {
      return res?.data?.data ?? res?.data ?? null;
    },

    async init() {
      try {
        // 1) 先拿 /api/user 的 data.id
        const userWrap = await this.$axios.get('/api/user');
        const user = this.unwrap(userWrap);
        if (!user?.id) {
          alert('无法获取商家ID，请登录后重试');
          this.loaded = true;
          return;
        }
        const id = Number(user.id);

        // 2) 用 id 拉完整实体
        const bizWrap = await this.$axios.get(`/api/businesses/${encodeURIComponent(id)}`);
        const data = this.unwrap(bizWrap);
        if (!data) {
          alert('未获取到店铺信息');
          this.loaded = true;
          return;
        }

        // 保存完整体
        this.businessFull = { ...data, id };

        // 映射可编辑字段
        this.businessForm = {
          businessName: data.businessName ?? '',
          businessAddress: data.businessAddress ?? '',
          businessExplain: data.businessExplain ?? '',
          businessImg: data.businessImg ?? '',
          orderTypeId: data.orderTypeId != null ? Number(data.orderTypeId) : 1,
          startPrice: data.startPrice != null ? Number(data.startPrice) : 0,
          deliveryPrice: data.deliveryPrice != null ? Number(data.deliveryPrice) : 0,
          remarks: data.remarks ?? ''
        };

        this.loaded = true;
      } catch (e) {
        console.error('初始化失败：', e);
        alert('加载商家信息失败，请稍后重试');
        this.loaded = true;
      }
    },

    handleImageUpload(e) {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => (this.businessForm.businessImg = ev.target.result);
      reader.readAsDataURL(f);
    },

    validMoney(v) {
      return /^\d+(\.\d{1,2})?$/.test(String(v));
    },

    async submitForm() {
      // 基础校验
      if (!this.validMoney(this.businessForm.startPrice)) {
        alert('起送费格式不正确，最多两位小数');
        return;
      }
      if (!this.validMoney(this.businessForm.deliveryPrice)) {
        alert('配送费格式不正确，最多两位小数');
        return;
      }

      // 关键：构造“完整实体”作为 PUT body
      // 以 businessFull 为底，覆盖为表单中的可编辑字段
      const payload = {
        ...this.businessFull,
        businessName: this.businessForm.businessName,
        businessAddress: this.businessForm.businessAddress,
        businessExplain: this.businessForm.businessExplain,
        businessImg: this.businessForm.businessImg,
        orderTypeId: Number(this.businessForm.orderTypeId),
        startPrice: Number(this.businessForm.startPrice),
        deliveryPrice: Number(this.businessForm.deliveryPrice),
        remarks: this.businessForm.remarks
      };

      // （可选）确保与后端期望字段保持类型一致
      payload.id = Number(payload.id);
      if (payload.businessOwner && typeof payload.businessOwner === 'object') {
        // authorities 可能是 [{name:'...'}]，保持原样
      }

      // 仅为方便你核对：打印出来看看是否与后端示例一模一样
      // console.log('PUT payload:', JSON.stringify(payload, null, 2));

      try {
        const resWrap = await this.$axios.put(
          `/api/businesses/${encodeURIComponent(payload.id)}`,
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const returned = this.unwrap(resWrap);

        // 用返回的最新完整体覆盖 businessFull，并更新表单可编辑字段
        if (returned) {
          this.businessFull = returned;
          this.businessForm = {
            businessName: returned.businessName ?? this.businessForm.businessName,
            businessAddress: returned.businessAddress ?? this.businessForm.businessAddress,
            businessExplain: returned.businessExplain ?? this.businessForm.businessExplain,
            businessImg: returned.businessImg ?? this.businessForm.businessImg,
            orderTypeId: returned.orderTypeId != null ? Number(returned.orderTypeId) : this.businessForm.orderTypeId,
            startPrice: returned.startPrice != null ? Number(returned.startPrice) : this.businessForm.startPrice,
            deliveryPrice: returned.deliveryPrice != null ? Number(returned.deliveryPrice) : this.businessForm.deliveryPrice,
            remarks: returned.remarks ?? this.businessForm.remarks
          };
        }

        alert('提交成功！');
      } catch (err) {
        console.error('提交失败：', err);
        alert('提交失败：' + (err.response?.data?.message || err.message));
      }
    },

    reload() {
      this.loaded = false;
      this.init();
    },
    toFood(){
      this.$router.push({
					path: '/goodsManage'
				});
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style scoped>
.seller-page { max-width: 720px; margin: auto; padding: 24px; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, 'PingFang SC', 'Microsoft YaHei'; }
h2 { text-align: center; margin-bottom: 8px; color: #2c3e50; }
.hint { text-align: center; color: #666; margin-bottom: 16px; }
.loading { text-align: center; color: #666; padding: 40px 0; }

form { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
.form-item { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-row .form-item { margin-bottom: 0; }

label { font-weight: 600; color: #444; }
input, select { border: 1px solid #dcdfe6; border-radius: 8px; padding: 10px 12px; font-size: 14px; outline: none; transition: border-color .2s ease; }
input:focus, select:focus { border-color: #409eff; }

.img-box { margin-top: 8px; }
.img-box img { max-width: 220px; border-radius: 10px; box-shadow: 0 1px 6px rgba(0,0,0,.15); }
.img-empty { color: #999; font-size: 13px; }

.button-group { display: flex; gap: 12px; margin-top: 10px; }
button { flex: 1; height: 40px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all .15s ease; }
button.primary { background: #28a745; color: #fff; }
button.secondary { background: #e6a23c; color: #fff; }
button:hover { opacity: .95; transform: translateY(-1px); }

@media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }
</style>
