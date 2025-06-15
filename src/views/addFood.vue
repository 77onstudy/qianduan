<template>
    <div class="form-card">
      <h2>添加食品</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>食品名称</label>
          <input v-model="form.foodName" required />
        </div>
  
        <div class="form-group">
          <label>食品介绍</label>
          <input v-model="form.foodExplain" required />
        </div>
  
        <div class="form-group">
          <label>食品图片</label>
          <input type="file" @change="handleImageUpload" accept="image/*" required />
          <div v-if="form.foodImg" class="preview">
            <img :src="form.foodImg" alt="预览" />
          </div>
        </div>
  
        <div class="form-group">
          <label>食品价格</label>
          <input v-model.number="form.foodPrice" type="number" step="0.01" required />
        </div>
  
        <div class="form-group">
          <label>备注</label>
          <textarea v-model="form.remarks" rows="2" />
        </div>
  
        <div class="form-buttons">
          <button type="submit" class="add">提交添加</button>
          <button type="button" class="cancel" @click="resetForm">清空表单</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        businessId: null,
        form: {
          foodName: '',
          foodExplain: '',
          foodImg: '',
          foodPrice: '',
          remarks: ''
        }
      }
    },
    created() {
      this.businessId = this.$route.query.businessId;
    },
    methods: {
      submitForm() {
        const payload = this.$qs.stringify({
          ...this.form,
          businessId: this.businessId
        });
        this.$axios.post('/FoodController/saveFood', payload).then(res => {
          if (res.data.code === 0) {
            alert('添加成功！');
            this.$router.push({ path: '/goodsManage', query: { businessId: this.businessId } });
          } else {
            alert('添加失败');
          }
        });
      },
      handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = e => {
            this.form.foodImg = e.target.result;
          };
          reader.readAsDataURL(file);
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
  }
  </script>
  