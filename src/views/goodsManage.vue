<template>
    <div class="goods-manage">
      <h2>🍱 食品管理</h2>
  
      <!-- 添加/编辑表单 -->
      <form @submit.prevent="handleSubmit">
        <input v-model="form.foodName" placeholder="食品名称" required />
        <input v-model="form.foodExplain" placeholder="食品介绍" required />
        <input v-model="form.foodImg" placeholder="食品图片URL" required />
        <input v-model.number="form.foodPrice" placeholder="食品价格" type="number" step="0.01" required />
        <textarea v-model="form.remarks" placeholder="备注"></textarea>
        <button type="submit">{{ form.foodId ? '修改' : '添加' }}</button>
        <button type="button" @click="resetForm">清空</button>
      </form>
  
      <!-- 食品列表 -->
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
            <td><img :src="food.foodImg" alt="" style="width:50px;" /></td>
            <td>{{ food.foodPrice }}</td>
            <td>{{ food.remarks }}</td>
            <td>
              <button @click="editFood(food)">编辑</button>
              <button @click="deleteFood(food.foodId)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    data() {
      return {
        foodList: [],
        form: {
          foodId: null,
          foodName: '',
          foodExplain: '',
          foodImg: '',
          foodPrice: '',
          remarks: '',
        },
        businessId: null,
      }
    },
    created() {
      this.businessId = this.$route.query.businessId
      this.getFoodList()
    },
    methods: {
      getFoodList() {
        axios.get(`/api/food?businessId=${this.businessId}`).then(res => {
          this.foodList = res.data
        })
      },
      handleSubmit() {
        const url = this.form.foodId ? '/api/food/update' : '/api/food/add'
        const payload = { ...this.form, businessId: this.businessId }
  
        axios.post(url, payload).then(() => {
          this.getFoodList()
          this.resetForm()
        })
      },
      editFood(food) {
        this.form = { ...food }
      },
      deleteFood(id) {
        if (confirm('确定删除？')) {
          axios.post('/api/food/delete', { foodId: id }).then(() => {
            this.getFoodList()
          })
        }
      },
      resetForm() {
        this.form = {
          foodId: null,
          foodName: '',
          foodExplain: '',
          foodImg: '',
          foodPrice: '',
          remarks: '',
        }
      },
    }
  }
  </script>
  
  <style scoped>
  .goods-manage {
    max-width: 800px;
    margin: auto;
  }
  form {
    margin-bottom: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px;
  }
  img {
    border-radius: 4px;
  }
  </style>
  