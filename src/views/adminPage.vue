
<template>
    <div class="admin-wrapper">
      <header class="admin-header">
        <h2>商家管理（管理员）</h2>
        <div class="actions">
          <button @click="loadBusinesses" :disabled="loading">
            {{ loading ? '刷新中...' : '刷新列表' }}
          </button>
        </div>
      </header>
  
      <!-- 新建商家 -->
      <section class="card">
        <h3>新建商家</h3>
        <div class="form-grid">
          <label>
            商家名称
            <input v-model.trim="form.businessName" placeholder="如：半亩方塘便当" />
          </label>
          <label>
            店主用户名
            <input v-model.trim="form.businessOwnerUsername" placeholder="绑定已存在的用户 username" />
          </label>
          <label>
            起送价
            <input type="number" step="0.01" v-model.number="form.startPrice" placeholder="0.00" />
          </label>
          <label>
            配送费
            <input type="number" step="0.01" v-model.number="form.deliveryPrice" placeholder="0.00" />
          </label>
          <label class="col-span-2">
            地址
            <input v-model.trim="form.businessAddress" placeholder="详细地址" />
          </label>
          <label class="col-span-2">
            说明
            <input v-model.trim="form.businessExplain" placeholder="商家简介/说明" />
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
            {{ creating ? '提交中...' : '创建商家' }}
          </button>
          <button class="ghost" @click="resetForm" :disabled="creating">重置</button>
        </div>
      </section>
  
      <!-- 商家列表 -->
      <section class="card">
        <div class="list-header">
          <h3>商家列表</h3>
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
              <button class="danger" @click="confirmDelete(b)">删除</button>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 删除确认 -->
      <div v-if="confirming" class="modal-backdrop">
        <div class="modal">
          <p>确定删除商家「{{ confirming?.name }}」（ID: {{ confirming?.id }}）吗？此操作不可恢复。</p>
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
        API_LIST: '/api/businesses/All',
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
          businessOwnerUsername: '', // 用用户名绑定店主（后端据此查 User）
          businessAddress: '',
          businessExplain: '',
          businessImg: '',
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
          this.error = e?.response?.data?.message || '加载商家列表失败';
        } finally {
          this.loading = false;
        }
      },
  
      resetForm() {
        this.form = {
          businessName: '',
          businessOwnerUsername: '',
          businessAddress: '',
          businessExplain: '',
          businessImg: '',
          startPrice: null,
          deliveryPrice: null,
          remarks: ''
        };
      },
  
      async createBusiness() {
        if (!this.form.businessName) return alert('请填写商家名称');
        if (!this.form.businessOwnerUsername) return alert('请填写店主用户名');
  
        this.creating = true;
        this.error = '';
        try {
          // 直接把 JSON 按后端命名传过去（避免 415）
          // 若后端要求 businessOwner 是对象（如 {id} 或 {username}），
          // 可改为：businessOwner: { username: this.form.businessOwnerUsername }
          const body = { ...this.form };
  
          await this.$axios.post(this.API_CREATE, body);
          // 为避免对返回体结构的依赖，创建后统一刷新列表
          await this.loadBusinesses();
          this.resetForm();
          alert('创建成功');
        } catch (e) {
          console.error(e);
          this.error = e?.response?.data?.message || '创建商家失败';
        } finally {
          this.creating = false;
        }
      },
  
      confirmDelete(biz) {
        this.confirming = biz;
      },
  
      async deleteBusiness(biz) {
        if (!biz?.id) return alert('无效的商家ID');
        try {
          await this.$axios.delete(this.API_DELETE(biz.id));
          // 本地移除，无需依赖返回体
          this.items = this.items.filter(x => x.id !== biz.id);
          this.confirming = null;
          alert('删除成功');
        } catch (e) {
          console.error(e);
          this.error = e?.response?.data?.message || '删除失败';
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
  