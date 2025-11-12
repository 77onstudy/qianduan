<template>
    <div class="admin-wrapper">
      <header class="admin-header">
        <h2>编辑店铺</h2>
        <div class="actions">
          <button @click="goBack">返回列表</button>
        </div>
      </header>
  
      <section class="card">
        <h3>店铺信息</h3>
  
        <div v-if="loading" class="hint">加载中...</div>
        <div v-else>
          <div class="form-grid">
            <label>
              店铺名称
              <input v-model.trim="form.businessName" placeholder="如：半亩方塘便当" />
            </label>
            <label>
              店主用户ID
              <input type="number" v-model.number="form.businessOwnerId" placeholder="绑定已存在且已激活的用户ID" />
            </label>
            <label>
              起送价
              <input type="number" step="0.01" v-model.number="form.startPrice" placeholder="0.00" />
            </label>
            <label>
              配送费
              <input type="number" step="0.01" v-model.number="form.deliveryPrice" placeholder="0.00" />
            </label>
  
            <label>
              订单类型ID
              <input type="number" v-model.number="form.orderTypeId" placeholder="如：26" />
            </label>
  
            <label class="col-span-2">
              地址
              <input v-model.trim="form.businessAddress" placeholder="详细地址" />
            </label>
            <label class="col-span-2">
              说明
              <input v-model.trim="form.businessExplain" placeholder="店铺简介/说明" />
            </label>
            <label class="col-span-2">
              备注
              <input v-model.trim="form.remarks" placeholder="可选" />
            </label>
            <label class="col-span-2">
              封面图 URL
              <input v-model.trim="form.businessImg" placeholder="https://..." />
            </label>
          </div>
  
          <div class="form-actions">
            <button @click="updateBusiness" :disabled="saving">{{ saving ? '保存中...' : '保存修改' }}</button>
            <button class="ghost" @click="goBack" :disabled="saving">取消</button>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AdminBusinessEdit',
  
    data() {
      return {
        id: Number(this.$route.params.id),
        loading: false,
        saving: false,
        error: '',
        form: {
          businessName: '',
          businessOwnerId: null,
          businessAddress: '',
          businessExplain: '',
          businessImg: '',
          orderTypeId: null,
          startPrice: null,
          deliveryPrice: null,
          remarks: ''
        }
      };
    },
  
    methods: {
      goBack() {
        this.$router.push({path:'/adminPage'});
      },
  
      // 将后端的实体映射到表单
      _fillFormFromEntity(it = {}) {
        this.form = {
          businessName: it.businessName ?? '',
          businessOwnerId: it.businessOwner?.id ?? null,
          businessAddress: it.businessAddress ?? '',
          businessExplain: it.businessExplain ?? '',
          businessImg: it.businessImg ?? '',
          orderTypeId: it.orderTypeId ?? null,
          startPrice: it.startPrice ?? null,
          deliveryPrice: it.deliveryPrice ?? null,
          remarks: it.remarks ?? ''
        };
      },
  
      async loadDetail() {
        this.error = '';
        this.loading = true;
        try {
          // 读取详情：GET /api/businesses/{id}
          const res = await this.$axios.get(`/api/businesses/${this.id}`, {
            headers: { Accept: 'application/json' }
          });
          // 兼容 {success, data} 包装
          const data = res?.data?.data ?? res?.data;
          if (!data) throw new Error('未获取到店铺详情');
          this._fillFormFromEntity(data);
        } catch (e) {
          console.error(e);
          this.error = e?.response?.data?.message || e?.message || '加载店铺详情失败';
        } finally {
          this.loading = false;
        }
      },
  
      async updateBusiness() {
        this.error = '';
        // 校验
        if (!this.form.businessName) {
          this.error = '请填写店铺名称';
          return;
        }
        if (this.form.businessOwnerId == null || this.form.businessOwnerId === '') {
          this.error = '请填写店主用户ID';
          return;
        }
        if (this.form.orderTypeId == null || this.form.orderTypeId === '') {
          this.error = '请填写订单类型ID';
          return;
        }
  
        const startPrice = this.form.startPrice == null || this.form.startPrice === '' ? null : Number(this.form.startPrice);
        const deliveryPrice = this.form.deliveryPrice == null || this.form.deliveryPrice === '' ? null : Number(this.form.deliveryPrice);
        if (startPrice != null && !Number.isFinite(startPrice)) {
          this.error = '起送价格式不正确';
          return;
        }
        if (deliveryPrice != null && !Number.isFinite(deliveryPrice)) {
          this.error = '配送费格式不正确';
          return;
        }
  
        this.saving = true;
        try {
          // 保存：PUT /api/businesses/{id}
          const body = {
            businessName: this.form.businessName,
            businessOwner: { id: Number(this.form.businessOwnerId) },
            businessAddress: this.form.businessAddress,
            businessExplain: this.form.businessExplain,
            businessImg: this.form.businessImg,
            orderTypeId: Number(this.form.orderTypeId),
            startPrice: startPrice,
            deliveryPrice: deliveryPrice,
            remarks: this.form.remarks
          };
  
          await this.$axios.put(`/api/businesses/${this.id}`, body, {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
          });
  
          alert('保存成功');
          this.goBack();
        } catch (e) {
          console.error(e);
          this.error = e?.response?.data?.message || e?.response?.data?.error || e?.message || '保存失败';
        } finally {
          this.saving = false;
        }
      }
    },
  
    mounted() {
      this.loadDetail();
    }
  };
  </script>
  
  <style scoped>
  .admin-wrapper{max-width:1080px;margin:0 auto;padding:16px}
  .admin-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
  .actions button{padding:8px 14px;border-radius:10px;border:1px solid #ddd;background:#fff;cursor:pointer}
  .card{background:#fff;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,.06);padding:16px;margin-bottom:16px}
  .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .form-grid label{display:grid;gap:6px;font-size:14px}
  .form-grid input{padding:8px 10px;border:1px solid #ddd;border-radius:10px}
  .col-span-2{grid-column:span 2}
  .form-actions{margin-top:12px;display:flex;gap:10px}
  button{padding:8px 14px;border-radius:10px;border:none;background:#0ea5e9;color:#fff;cursor:pointer}
  button.ghost{background:#eef2f7;color:#333}
  .hint{color:#888}
  .error{color:#ef4444}
  </style>
  