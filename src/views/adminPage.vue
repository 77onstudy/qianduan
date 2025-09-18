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
            名称
            <input v-model.trim="form.name" placeholder="请输入商家名称" />
          </label>
          <label>
            地址
            <input v-model.trim="form.address" placeholder="请输入地址" />
          </label>
          <label>
            电话
            <input v-model.trim="form.phone" placeholder="选填：联系电话" />
          </label>
          <label class="col-span-2">
            备注
            <input v-model.trim="form.remark" placeholder="选填：备注信息" />
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
            placeholder="按名称/地址搜索（前端筛选）"
          />
        </div>
  
        <div v-if="error" class="error">{{ error }}</div>
  
        <div class="table">
          <div class="thead">
            <div class="th id">ID</div>
            <div class="th name">名称</div>
            <div class="th addr">地址</div>
            <div class="th phone">电话</div>
            <div class="th remark">备注</div>
            <div class="th ops">操作</div>
          </div>
  
          <div v-if="filtered.length === 0" class="empty">
            暂无数据
          </div>
  
          <div v-for="b in filtered" :key="b.id" class="trow">
            <div class="td id">{{ b.id }}</div>
            <div class="td name">{{ b.name }}</div>
            <div class="td addr">{{ b.address || '-' }}</div>
            <div class="td phone">{{ b.phone || '-' }}</div>
            <div class="td remark">{{ b.remark || '-' }}</div>
            <div class="td ops">
              <button class="danger" @click="confirmDelete(b)">删除</button>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 简单删除确认 -->
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
        // ====== 根据你的后端改这里 ======
        API_LIST: '/api/businesses/All',
        API_CREATE: '/api/businesses',
        API_DELETE: (id) => `/api/businesses/${id}`,
        // =================================
  
        loading: false,
        creating: false,
        error: '',
        items: [],
        keyword: '',
        form: {
          name: '',
          address: '',
          phone: '',
          remark: ''
        },
        confirming: null
      };
    },
  
    computed: {
      filtered() {
        const k = this.keyword.toLowerCase();
        if (!k) return this.items;
        return this.items.filter((b) => {
          return (
            (b.name || '').toLowerCase().includes(k) ||
            (b.address || '').toLowerCase().includes(k)
          );
        });
      }
    },
  
    methods: {
      async loadBusinesses() {
        this.error = '';
        this.loading = true;
        try {
          const res = await this.$axios.get(this.API_LIST);
          // 兼容不同返回壳：直接数组或 {data: []} 或 {success, data}
          const data = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          this.items = data;
        } catch (e) {
          console.error(e);
          this.error = '加载商家列表失败';
        } finally {
          this.loading = false;
        }
      },
  
      resetForm() {
        this.form = { name: '', address: '', phone: '', remark: '' };
      },
  
      async createBusiness() {
        if (!this.form.name) {
          alert('请填写商家名称');
          return;
        }
        this.creating = true;
        this.error = '';
        try {
          // 默认 JSON 提交（后端 @RequestBody Business）
          const res = await this.$axios.post(this.API_CREATE, this.form);
          const created =
            res.data?.data || res.data || null; // 兼容不同包壳
          if (!created || !created.id) {
            // 后端没返回实体也没关系，直接刷新
            await this.loadBusinesses();
          } else {
            // 有返回就乐观更新
            this.items.unshift(created);
          }
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
        if (!biz?.id) {
          alert('无效的商家ID');
          return;
        }
        this.error = '';
        try {
          await this.$axios.delete(this.API_DELETE(biz.id));
          // 从本地移除
          this.items = this.items.filter((x) => x.id !== biz.id);
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
  .admin-wrapper {
    max-width: 1080px;
    margin: 0 auto;
    padding: 16px;
  }
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .actions button {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid #ddd;
    background: #fff;
    cursor: pointer;
  }
  .card {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 14px rgba(0,0,0,.06);
    padding: 16px;
    margin-bottom: 16px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .form-grid label {
    display: grid;
    gap: 6px;
    font-size: 14px;
  }
  .form-grid input {
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
  }
  .form-actions {
    margin-top: 12px;
    display: flex;
    gap: 10px;
  }
  button {
    padding: 8px 14px;
    border-radius: 10px;
    border: none;
    background: #0ea5e9;
    color: #fff;
    cursor: pointer;
  }
  button.ghost {
    background: #eef2f7;
    color: #333;
  }
  button.danger {
    background: #ef4444;
  }
  .table {
    width: 100%;
  }
  .thead, .trow {
    display: grid;
    grid-template-columns: 100px 1fr 2fr 1fr 1.5fr 160px;
    gap: 8px;
    align-items: center;
  }
  .thead {
    font-weight: 600;
    color: #555;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  .trow {
    padding: 10px 0;
    border-bottom: 1px solid #f2f2f2;
  }
  .empty {
    padding: 16px 0;
    color: #888;
  }
  .error {
    color: #ef4444;
    margin-bottom: 10px;
  }
  .search {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 8px 10px;
    width: 280px;
  }
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.35);
    display: grid; place-items: center;
  }
  .modal {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    max-width: 520px;
    width: 92%;
  }
  .modal-actions {
    margin-top: 12px; display: flex; gap: 10px; justify-content: flex-end;
  }
  </style>
  