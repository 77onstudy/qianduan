<template>
  <div class="goods-manage">
    <h2>🍱 食品管理</h2>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>介绍</th>
            <th>图片</th>
            <th>价格</th>
            <th style="width:140px;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" style="text-align:center;color:#888;">加载中...</td>
          </tr>
          <tr v-else-if="!foodList.length">
            <td colspan="5" style="text-align:center;color:#888;">暂无食品</td>
          </tr>
          <tr v-else v-for="food in foodList" :key="food.id">
            <td>{{ food.foodName }}</td>
            <td class="ellipsis" :title="food.foodExplain">{{ food.foodExplain || '—' }}</td>
            <td>
              <img v-if="food.foodImg" :src="food.foodImg" alt="" />
              <span v-else class="img-empty">无图</span>
            </td>
            <td>￥{{ formatPrice(food.foodPrice) }}</td>
            <td>
              <button class="edit" @click="goToEdit(food.id)">编辑</button>
              <button class="delete" @click="deleteFood(food.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="top-bar">
      <button class="add" @click="goToAdd">➕ 添加新食品</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsManage',
  data() {
    return {
      loading: false,
      foodList: [],
      businessId: null
    }
  },
  created() {
    this.init();
  },
  methods: {
    // 统一解包：兼容 { data: { data: ... } } 或 { data: ... }
    unwrap(res) {
      return res?.data?.data ?? res?.data ?? null;
    },

    async init() {
      this.loading = true;
      try {
        // 1) 从 /api/user 拿 data.id 作为 businessId
        const userWrap = await this.$axios.get('/api/user');
        const user = this.unwrap(userWrap);
        if (!user?.id) {
          this.loading = false;
          alert('无法获取商家ID，请登录后重试');
          return;
        }
        this.businessId = Number(user.id);

        // 2) 拉取食品列表：/api/foods?businessId=xxx
        await this.getFoodList();
      } catch (err) {
        console.error('初始化失败:', err);
        alert('加载失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    async getFoodList() {
      try {
        const res = await this.$axios.get('/api/foods', { params: { businessId: this.businessId } });
        const list = this.unwrap(res);
        this.foodList = Array.isArray(list) ? list : [];
      } catch (err) {
        console.error('获取食品列表失败:', err);
        this.foodList = [];
      }
    },

    // 若列表项不是完整实体，这里补打一条 GET /api/foods/{id} 拿全量结构
    async getFullFood(id) {
      // 先从当前列表里找一找（有些后端列表就已经返回了完整结构）
      const inList = this.foodList.find(f => f.id === id);
      if (inList && inList.business && inList.foodName && inList.foodImg !== undefined) {
        return inList; // 看起来够全，直接用
      }

      // 不够全，就 GET /api/foods/{id}
      const res = await this.$axios.get(`/api/foods/${encodeURIComponent(id)}`);
      const data = this.unwrap(res);
      if (!data) throw new Error('未获取到食物详情');
      return data;
    },

    // 按你要求构造完整 Body；未知字段设为 null（或保持后端返回的原值）
    buildDeleteBody(fullFood) {
      return {
        id: fullFood.id ?? null,
        createTime: fullFood.createTime ?? null,
        updateTime: fullFood.updateTime ?? null,
        creator: fullFood.creator ?? null,
        updater: fullFood.updater ?? null,
        deleted: fullFood.deleted ?? null,
        foodName: fullFood.foodName ?? null,
        foodExplain: fullFood.foodExplain ?? null,
        foodImg: fullFood.foodImg ?? null,
        foodPrice: fullFood.foodPrice ?? null,
        business: fullFood.business ?? null, // 嵌套完整 business
        remarks: fullFood.remarks ?? null
      };
    },

    async deleteFood(id) {
      if (!confirm('确定要删除这条食品吗？')) return;
      try {
        // 1) 取完整实体
        const fullFood = await this.getFullFood(id);

        // 2) 构造 Body（严格对齐你的示例结构）
        const payload = this.buildDeleteBody(fullFood);

        // 3) 发送 DELETE /api/foods，携带 JSON Body
        // axios 支持 delete 的 data 通过 config.data 传递
        const res = await this.$axios.request({
          method: 'DELETE',
          url: '/api/foods',
          data: payload,
          headers: { 'Content-Type': 'application/json' }
        });

        const ok = res?.status >= 200 && res?.status < 300 && (res.data?.success !== false);
        if (ok) {
          // 刷新列表
          await this.getFoodList();
        } else {
          alert('删除失败：' + (res?.data?.message || '未知错误'));
        }
      } catch (err) {
        console.error('删除失败:', err);
        alert('删除失败：' + (err.response?.data?.message || err.message));
      }
    },

    goToAdd() {
      this.$router.push({ path: '/addFood', query: { businessId: this.businessId } });
    },

    goToEdit(foodId) {
      this.$router.push({ path: '/editFood', query: { foodId, businessId: this.businessId } });
    },

    formatPrice(v) {
      const n = Number(v);
      if (Number.isNaN(n)) return v ?? '0.00';
      return n.toFixed(2);
    }
  }
}
</script>


<style scoped>
.goods-manage {
  max-width: 960px;
  margin: auto;
  padding: 4px;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 14px;
  color: #333;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

button.add {
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

button.edit {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  margin-right: 6px;
  white-space: nowrap;
}

button.delete {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

th, td {
  padding: 12px;
  border: 1px solid #dee2e6;
  text-align: center;
}

td img {
  width: 60px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.img-empty { color:#999; }

.ellipsis {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
