
<template>
  <div class="admin-wrapper">
    <header class="admin-header">
      <h2>店铺管理（管理员）</h2>
      <div class="actions">
        <button @click="loadBusinesses" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新列表' }}
        </button>
      </div>
    </header>

<!-- 新建店铺 -->
<section class="card">
  <h3>新建店铺</h3>
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

    <!-- ✅ 新增：订单类型ID（orderTypeId） -->
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
    <button @click="createBusiness" :disabled="creating">
      {{ creating ? '提交中...' : '创建店铺' }}
    </button>
    <button class="ghost" @click="resetForm" :disabled="creating">重置</button>
  </div>
  <div v-if="formError" class="error" style="margin-top:8px">{{ formError }}</div>
</section>


    <!-- 店铺列表 -->
    <section class="card">
      <div class="list-header">
        <h3>店铺列表</h3>
        <input
            class="search"
            v-model.trim="keyword"
            placeholder="按名称 / 地址 / 店主搜索"
        />
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="table">
        <div class="thead">
          <div class="th id">ID</div>
          <div class="th cover">封面</div>
          <div class="th name">名称</div>
          <div class="th owner">店主</div>
          <div class="th addr">地址</div>
          <div class="th price">起送/配送</div>
          <div class="th remark">说明/备注</div>
          <div class="th ops">操作</div>
        </div>

        <div v-if="filtered.length === 0" class="empty">
          暂无数据
        </div>

        <div v-for="b in filtered" :key="b.id" class="trow">
          <div class="td id">{{ b.id }}</div>
          <div class="td cover">
            <img v-if="b.img" :src="b.img" alt="cover" class="thumb" />
            <span v-else>—</span>
          </div>
          <div class="td name">{{ b.name }}</div>
          <div class="td owner">{{ b.ownerUsername || '-' }}</div>
          <div class="td addr">{{ b.address || '-' }}</div>
          <div class="td price">
            <div>起送：{{ formatMoney(b.startPrice) }}</div>
            <div>配送：{{ formatMoney(b.deliveryPrice) }}</div>
          </div>
          <div class="td remark">
            <div class="line">{{ b.explain || '-' }}</div>
            <div class="line text-dim">{{ b.remark || '' }}</div>
          </div>
          <div class="td ops">
            <button @click="$router.push({ name: 'AdminBusinessEdit', params: { id: b.id } })">编辑</button>
            <button class="danger" @click="confirmDelete(b)">删除</button>
          </div>

        </div>
      </div>
    </section>

    <!-- 删除确认 -->
    <div v-if="confirming" class="modal-backdrop">
      <div class="modal">
        <p>确定删除店铺「{{ confirming?.name }}」（ID: {{ confirming?.id }}）吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="danger" @click="deleteBusiness(confirming)">确定删除</button>
          <button class="ghost" @click="confirming = null">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminBusiness',

  data() {
    return {
      // ==== 按你的后端接口调整这里 ====
      API_LIST: '/api/businesses',
      API_CREATE: '/api/businesses',           // POST JSON 创建
      API_DELETE: (id) => `/api/businesses/${id}`, // DELETE 按 ID
      // ==================================

      loading: false,
      creating: false,
      error: '',
      items: [],       // 映射后的列表（适合前端展示的字段）
      keyword: '',
      // 创建表单——字段名对齐后端
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
            },

      confirming: null
    };
  },

  computed: {
    filtered() {
      const k = this.keyword.trim().toLowerCase();
      if (!k) return this.items;
      return this.items.filter(b =>
          (b.name || '').toLowerCase().includes(k) ||
          (b.address || '').toLowerCase().includes(k) ||
          (b.ownerUsername || '').toLowerCase().includes(k)
      );
    }
  },

  methods: {
    // 金额格式化
    formatMoney(v) {
      if (v == null || v === '') return '-';
      const n = Number(v);
      return isNaN(n) ? '-' : n.toFixed(2);
    },

    // 把后端返回体映射成前端友好的字段
    _mapBusinessRow(it = {}) {
      return {
        id: it.id,
        name: it.businessName,
        address: it.businessAddress,
        img: it.businessImg,
        ownerUsername: it.businessOwner?.username ?? '',
        startPrice: it.startPrice,
        deliveryPrice: it.deliveryPrice,
        explain: it.businessExplain,
        remark: it.remarks
      };
    },

    async loadBusinesses() {
      this.error = '';
      this.loading = true;
      try {
        const res = await this.$axios.get(this.API_LIST);
        // 你的后端是 { success, code, data: [...] }
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        this.items = list.map(this._mapBusinessRow);
      } catch (e) {
        console.error(e);
        this.error = e?.response?.data?.message || '加载店铺列表失败';
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
          this.formError = '';
          this.form = {
            businessName: '',
            businessOwnerId: null,
            businessAddress: '',
            businessExplain: '',
            businessImg: '',
            orderTypeId: null,   
            startPrice: null,
            deliveryPrice: null,
            remarks: ''
          };
        },


        async createBusiness() {
              this.formError = '';
              if (!this.form.businessName) {
                this.formError = '请填写店铺名称';
                return;
              }
              if (this.form.businessOwnerId == null || this.form.businessOwnerId === '') {
                this.formError = '请填写店主用户ID';
                return;
              }
              if (this.form.orderTypeId == null || this.form.orderTypeId === '') {
                this.formError = '请填写订单类型ID';
                return;
              }

              const startPrice = this.form.startPrice == null || this.form.startPrice === '' ? null : Number(this.form.startPrice);
              const deliveryPrice = this.form.deliveryPrice == null || this.form.deliveryPrice === '' ? null : Number(this.form.deliveryPrice);

              if (startPrice != null && !Number.isFinite(startPrice)) {
                this.formError = '起送价格式不正确';
                return;
              }
              if (deliveryPrice != null && !Number.isFinite(deliveryPrice)) {
                this.formError = '配送费格式不正确';
                return;
              }

              this.creating = true;
              this.error = '';
              try {
                // === 按 /api/businesses 要求的 body 字段发送 ===
                const body = {
                  businessName: this.form.businessName,
                  businessOwner: { id: Number(this.form.businessOwnerId) }, // ✅ 嵌套对象只传 id
                  businessAddress: this.form.businessAddress,
                  businessExplain: this.form.businessExplain,
                  businessImg: this.form.businessImg,
                  orderTypeId: Number(this.form.orderTypeId),               // ✅ 新增字段
                  startPrice: startPrice,
                  deliveryPrice: deliveryPrice,
                  remarks: this.form.remarks
                };

                await this.$axios.post(this.API_CREATE, body, {
                  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
                });

                await this.loadBusinesses(); // 创建成功后刷新
                this.resetForm();
                alert('创建成功');
              } catch (e) {
                console.error(e);
                this.formError =
                  e?.response?.data?.message ||
                  e?.response?.data?.error ||
                  e?.message ||
                  '创建店铺失败';
              } finally {
                this.creating = false;
              }
            },


    confirmDelete(biz) {
      this.confirming = biz;
    },

    async deleteBusiness(biz) {
          if (!biz?.id) {
            alert('无效的商家ID');
            return;
          }

          try {
            console.log('[DELETE] 请求 -> /api/businesses/' + biz.id);

            // 直接 DELETE /api/businesses/{id}
            await this.$axios.delete(`/api/businesses/${biz.id}`, {
              headers: { Accept: 'application/json' }
            });

            // 删除后刷新列表，确保前端和后端一致
            await this.loadBusinesses();

            this.confirming = null;
            alert('删除成功');
          } catch (e) {
            console.error(e);
            this.error =
              e?.response?.data?.message ||
              e?.response?.data?.error ||
              e?.message ||
              '删除失败';
          }
        }


  },

  mounted() {
    this.loadBusinesses();
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
button.danger{background:#ef4444}
.table{width:100%}
.thead,.trow{display:grid;grid-template-columns:80px 90px 1.2fr 1fr 2fr 1.2fr 2fr 140px;gap:8px;align-items:center}
.thead{font-weight:600;color:#555;padding:8px 0;border-bottom:1px solid #eee}
.trow{padding:10px 0;border-bottom:1px solid #f2f2f2}
.thumb{width:68px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #eee}
.line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.text-dim{color:#888;font-size:12px}
.empty{padding:16px 0;color:#888}
.error{color:#ef4444;margin-bottom:10px}
.search{border:1px solid #ddd;border-radius:10px;padding:8px 10px;width:280px}
.list-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
</style>
  