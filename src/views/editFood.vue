<template>
    <div class="form-card">
      <h2>✏️ 编辑食品</h2>
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
          <label>食品价格</label>
          <input v-model.number="form.foodPrice" type="number" step="0.01" required />
        </div>
  
        <div class="form-group">
          <label>备注</label>
          <textarea v-model="form.remarks" rows="2" />
        </div>
        <div class="form-group">
          <label>食品图片</label>
          <input type="file" @change="handleImageUpload" accept="image/*" />
          <div v-if="form.foodImg" class="preview">
            <img :src="form.foodImg" alt="预览" />
          </div>
        </div>
  
        <div class="form-buttons">
          <button type="submit" class="btn save">保存修改</button>
          <button type="button" class="btn cancel" @click="resetForm">清空表单</button>
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
          foodId: null,
          foodName: '',
          foodExplain: '',
          foodImg: '',
          foodPrice: '',
          remarks: ''
        }
      }
    },
    created() {
      const { foodId, businessId } = this.$route.query;
      this.businessId = businessId;
      this.$axios.post('/FoodController/getFoodById', this.$qs.stringify({ foodId })).then(res => {
        if (res.data.code === 0) {
          this.form = res.data.data;
        } else {
          alert('获取食品信息失败');
        }
      });
    },
    methods: {
      submitForm() {
        const payload = this.$qs.stringify({
          ...this.form,
          businessId: this.businessId
        });
        this.$axios.post('/FoodController/updateFood', payload).then(res => {
          if (res.data.code === 0) {
            alert('修改成功！');
            this.$router.push({ path: '/goodsManage', query: { businessId: this.businessId } });
          } else {
            alert('修改失败');
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
          foodId: this.form.foodId,
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
  
  <style scoped>
  .form-card {
    max-width: 600px;
    margin: auto;
    padding: 24px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', sans-serif;
  }
  
  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
  }
  
  label {
    font-weight: bold;
    margin-bottom: 6px;
    color: #555;
  }
  
  input,
  textarea {
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  
  input:focus,
  textarea:focus {
    border-color: #409eff;
    outline: none;
  }
  
  .preview img {
    margin-top: 12px;
    max-width: 160px;
    border-radius: 10px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.2);
  }
  
  .form-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  
  .btn {
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .btn.save {
    background-color: #007bff;
    color: white;
  }
  
  .btn.cancel {
    background-color: #6c757d;
    color: white;
  }
  </style>
  