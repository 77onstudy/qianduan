<template>
    <div class="seller-page">
      <h2>商家信息管理</h2>
      <form v-if="business" @submit.prevent="submitForm">
        <!-- <div>
          <label>商家ID：</label>
          <input type="text" v-model="business.businessId" disabled />
        </div> -->
        <div>
          <label>商家名称：</label>
          <input type="text" v-model="business.businessName" />
        </div>
        <div>
          <label>商家地址：</label>
          <input type="text" v-model="business.businessAddress" />
        </div>
        <div>
          <label>商家介绍：</label>
          <input type="text" v-model="business.businessExplain" />
        </div>
        
        <div>
        <label>点餐分类：</label>
        <select v-model="business.orderTypeId">
            <option v-for="type in orderTypes" :key="type.id" :value="type.id">
            {{ type.name }}
            </option>
        </select>
        </div>

        <div>
          <label>起送费：</label>
          <input type="number" step="0.01" v-model="business.starPrice" />
        </div>
        <div>
          <label>配送费：</label>
          <input type="number" step="0.01" v-model="business.deliveryPrice" />
        </div>
        <div>
          <label>备注：</label>
          <input type="text" v-model="business.remarks" />
        </div>
        <div>
            <label>商家图片：</label>
        <input type="file" @change="handleImageUpload" accept="image/*" />
        <div v-if="business.businessImg">
            <img :src="business.businessImg" alt="预览" style="max-width: 200px; margin-top: 10px;" />
        </div>
        </div>
        <div class="button-group">
        <button type="submit" class="submit">提交</button>
        <button type="button" class="manage" @click="goToGoodsManage">管理商品</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>

  export default {
    name: "SellerPage",
    data() {
      return {
        orderTypes: [
            { id: 1, name: '美食' },
            { id: 2, name: '早餐' },
            { id: 3, name: '跑腿代购' },
            { id: 4, name: '汉堡披萨' },
            { id: 5, name: '甜品饮品' },
            { id: 6, name: '速食简餐' },
            { id: 7, name: '地方小吃' },
            { id: 8, name: '米粉面馆' },
            { id: 9, name: '包子粥铺' },
            { id: 10, name: '炸鸡炸串' }
        ],
        business: {
          businessId: 0,
          businessName: '',
          businessAddress: '',
          businessExplain: '',
          businessImg: '',
          orderTypeId: 1,
          starPrice: 1.00,
          deliveryPrice: 1.00,
          remarks: ''
        },
        seller:{
                sellerId:"777",
                businessId: 777,
                password:"777",
                businessName:"777",
		},
      }
    },
    methods: {
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                this.business.businessImg = e.target.result; // base64 字符串
                };
                reader.readAsDataURL(file);
            }
            },

            fetchBusinessInfo() {
                    this.$axios.post(
                        'BusinessController/getBusinessById',
                        this.$qs.stringify({
                        businessId: this.business.businessId
                        })
                    )
                    .then(response => {
                        if (response.data) {
                        Object.assign(this.business, response.data); 
                        } else {
                        console.warn('获取数据失败，接口返回不符合预期', response.data);
                        }
                    })
                    .catch(error => {
                        console.error('获取商家信息失败：', error);
                    });
            },
            submitForm() {
                //console.log('当前 business 数据：', this.business);
            const delivery = this.business.deliveryPrice;
            const pricePattern = /^\d+(\.\d{1,2})?$/;

            if (!pricePattern.test(delivery)) {
                alert("配送费格式不正确，请输入最多两位小数的非负数字，例如 12.50");
                return;
            }

            const star = this.business.starPrice;
            if (!pricePattern.test(star)) {
                alert("起送费格式不正确，请输入最多两位小数的非负数字，例如 8.00");
                return;
            }

            this.$axios.post(
                '/BusinessController/updateBusiness',
                this.$qs.stringify(this.business)
            )
            .then(res => {
                if (res.data.code === 0) {
                alert("提交成功！");
                } else {
                console.error("提交失败:", res.data.message || res.data);
                alert("提交失败：" + (res.data.message || "未知错误"));
                }
            })
            .catch(error => {
                console.error("请求异常:", error);
                alert("提交异常：" + error.message);
            });
            },

      goToGoodsManage() {
        this.$router.push({ path: '/goodsManage', query: { businessId: this.business.businessId } });
      }
    },
    mounted() {
        
      this.business.businessId = this.$route.query.businessId;
      this.fetchBusinessInfo();
    }
  }
  </script>
  
  <style scoped>
  .seller-page {
    max-width: 720px;
    margin: auto;
    padding: 24px;
    font-family: 'Segoe UI', sans-serif;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 24px;
    color: #2c3e50;
  }
  
  form {
    background-color: #ffffff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  form > div {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
  }
  
  label {
    font-weight: 600;
    margin-bottom: 6px;
    color: #444;
  }
  
  input,
  select,
  textarea {
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  
  input:focus,
  select:focus,
  textarea:focus {
    border-color: #409eff;
    outline: none;
  }
  
  img {
    margin-top: 10px;
    max-width: 200px;
    border-radius: 10px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.2);
  }
  
  .button-group {
    display: flex;
    gap: 16px;
    margin-top: 20px;
  }
  
  button {
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  button.submit {
    background-color: #28a745;
    color: white;
  }
  
  button.manage {
    background-color: #007bff;
    color: white;
  }
  
  button:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
  </style>
  