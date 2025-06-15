
<template>
  <div class="goods-manage">
    <h2>🍱 食品管理</h2>

    <!-- 添加按钮 -->
    <div class="top-bar">
      <button class="add" @click="goToAdd">➕ 添加新食品</button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>介绍</th>
            <th>图片</th>
            <th>价格</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="food in foodList" :key="food.foodId">
            <td>{{ food.foodName }}</td>
            <td>{{ food.foodExplain }}</td>
            <td><img :src="food.foodImg" alt="" /></td>
            <td>{{ food.foodPrice }}</td>
            <td>{{ food.remarks }}</td>
            <td>
              <button class="edit" @click="goToEdit(food.foodId)">编辑</button>
              <button class="delete" @click="deleteFood(food.foodId)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      foodList: [],
      businessId: null
    }
  },
  created() {
    this.businessId = this.$route.query.businessId
    this.getFoodList()
  },
  methods: {
    getFoodList() {
      this.$axios.post('/FoodController/listFoodByBusinessId', this.$qs.stringify({
        businessId: this.businessId
      })).then(res => {
        this.foodList = res.data
      })
    },
    deleteFood(id) {
      if (confirm('确定要删除这条食品吗？')) {
        this.$axios.post('/FoodController/removeFood', this.$qs.stringify({
          foodId: id,
          businessId: this.businessId
        })).then(res => {
          if (res.data.code === 0) this.getFoodList()
          else alert('删除失败: ' + (res.data.message || '未知错误'))
        })
      }
    },
    goToAdd() {
      this.$router.push({ path: '/addFood', query: { businessId: this.businessId } });
    },
    goToEdit(foodId) {
      this.$router.push({ path: '/editFood', query: { foodId:foodId, businessId: this.businessId } });
    }
  }
}
</script>

<style scoped>
.goods-manage {
  max-width: 960px;
  margin: auto;
  padding: 24px;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

button.add {
  background-color: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
}

button.edit {
  background-color: #17a2b8;
  color: white;
  margin-right: 6px;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
}

button.delete {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
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
</style>
