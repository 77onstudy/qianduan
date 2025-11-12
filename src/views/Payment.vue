<template>
  <div class="wrapper">
    <!-- 顶部导航 - 添加返回按钮 -->
    <header>
      <div class="back-button" @click="$router.go(-1)">
        <span class="back-symbol">&lt;</span>
      </div>
      <p>在线支付</p>
    </header>

    <div class="content">
      <h3>订单信息：</h3>
      <div class="order-info">
        <p>
          {{orders.business.businessName}}
          <i class="fa fa-angle-down" @click="detailetShow"></i>
        </p>
        <p>&#165;{{orders.orderTotal}}</p>
      </div>

      <div class="order-detailet" v-show="isShowDetailet">
        <li v-for="(item, index) in orders.list" :key="item.food.foodId || index">
          <p>{{item.food.foodName}} x {{item.quantity}}</p>
          <p>&#165;{{(item.food.foodPrice * item.quantity).toFixed(2)}}</p>
        </li>
        <li>
          <p>配送费</p>
          <p>&#165;{{orders.business.deliveryPrice}}</p>
        </li>
      </div>

      <div class="payment-section">
        <h3>支付方式:</h3>
        <div class="payment-type">
          <!-- 选中时添加active类，保留方形圆弧+浮动+边框包围效果 -->
          <li 
            @click="selectPayment('alipay')" 
            :class="{ active: paymentType === 'alipay' }"
          >
            <img src="../assets/alipay.png" alt="支付宝">
          </li>
          <li 
            @click="selectPayment('wechat')" 
            :class="{ active: paymentType === 'wechat' }"
          >
            <img src="../assets/wechat.png" alt="微信支付">
          </li>
        </div>
      </div>

      <div class="payment-button">
        <button @click="confirmPayment">确认支付</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentPage',
  data() {
    return {
      orderId: this.$route.query.orderId,
      orders: { business: {}, list: [] },
      isShowDetailet: false,
      paymentType: 'wechat'
    }
  },
  created() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('请先登录！');
      this.$router.push('/login');
      return;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 获取订单详情：GET /api/orders/{id}
    this.$axios.get(`/api/orders/${this.orderId}`, config)
      .then(res => {
        const r = res.data || {};
        if (r.success) {
          // 字段兼容：把后端的 orderDetails 映射到前端沿用的 list
          const data = r.data || {};
          data.list = data.orderDetails || [];
          // 兼容 orderId
          data.orderId = data.id;
          this.orders = data;
        } else {
          alert(r.message || '获取订单失败');
        }
      })
      .catch(err => {
        console.error(err);
        alert('网络错误，无法获取订单信息');
      });
  },
  mounted() {
    history.pushState(null, null, document.URL);
    window.onpopstate = () => this.$router.push({ path: '/index' });
  },
  unmounted() {
    window.onpopstate = null;
  },
  methods: {
    detailetShow() {
      this.isShowDetailet = !this.isShowDetailet;
    },
    selectPayment(type) {
      this.paymentType = type;
    },
    confirmPayment() {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('请先登录！');
        this.$router.push('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 支付订单：PATCH /api/orders/pay/{id}
      this.$axios.patch(`/api/orders/pay/${this.orderId}`, null, config)
        .then(res => {
          const r = res.data || {};
          if (r.success) {
            this.$router.push('/orderList');
          } else {
            alert(r.message || '支付失败，请重试！');
          }
        })
        .catch(err => {
          console.error(err);
          alert('支付请求出错，请检查网络');
        });
    }
  },
}
</script>

<style scoped>
/* ===== 全局样式 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
}

.wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #f8faf9;
  display: flex;
  flex-direction: column;
}

/* ===== 头部样式 ===== */
header {
  width: 100%;
  height: 64px;
  background-color: #8faca5;
  color: white;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.back-symbol {
  font-size: 22px;
  font-weight: 600;
  color: white;
}

/* ===== 主体内容 ===== */
.content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

h3 {
  font-size: 18px;
  color: #64748b;
  margin: 20px 0 15px;
  font-weight: 500;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

/* ===== 订单信息 ===== */
.order-info {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.order-info p:first-child {
  font-size: 18px;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-info p:last-child {
  font-size: 20px;
  font-weight: 600;
  color: #8faca5;
}

/* 向下三角图标样式 */
.fa-angle-down {
  color: #8faca5;
  cursor: pointer;
  transition: transform 0.3s ease;
  font-size: 18px;
}

.fa-angle-down:hover {
  transform: translateY(2px);
}

/* ===== 订单明细 ===== */
.order-detailet {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.order-detailet li {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f2;
  list-style: none;
}

.order-detailet li:last-child {
  border-bottom: none;
}

.order-detailet li p:first-child {
  color: #64748b;
}

.order-detailet li p:last-child {
  color: #1e293b;
  font-weight: 500;
}

/* ===== 支付方式（核心修改：恢复四角圆弧方形） ===== */
.payment-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.payment-type {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

/* 基础样式：四角圆弧方形 */
.payment-type li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #f8fafc;
  border-radius: 12px; /* 恢复四角圆弧，与原设计一致 */
  border: 2px solid transparent; /* 透明边框，选中时显示 */
  cursor: pointer;
  transition: all 0.3s ease;
  list-style: none;
}

/* 未选中状态：轻微阴影+默认样式 */
.payment-type li:not(.active) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 选中状态：向上浮动+彩色边框包围 */
.payment-type li.active {
  transform: translateY(-6px); /* 向上浮动，视觉更轻盈 */
  border-color: #8faca5; /* 圆圈色边框（方形外框） */
  box-shadow: 0 8px 16px rgba(143, 172, 165, 0.2); /* 强化浮动阴影 */
  background: white; /* 选中时背景变白，突出边框 */
}

.payment-type li img {
  height: 45px;
  object-fit: contain;
}

/* ===== 支付按钮 ===== */
.payment-button {
  padding: 20px;
}

.payment-button button {
  width: 100%;
  height: 50px;
  background: #8faca5;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(143, 172, 165, 0.3);
}

.payment-button button:hover {
  background: #7a9c94;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(143, 172, 165, 0.4);
}

/* ===== 响应式设计（同步适配方形样式） ===== */
@media (min-width: 768px) {
  .content {
    padding: 30px;
  }
  
  header {
    height: 70px;
    font-size: 22px;
  }
  
  .back-button {
    width: 45px;
    height: 45px;
  }
  
  h3 {
    font-size: 20px;
    margin: 30px 0 20px;
  }
  
  .order-info {
    padding: 25px;
  }
  
  .order-info p:first-child {
    font-size: 20px;
  }
  
  .order-info p:last-child {
    font-size: 22px;
  }
  
  .order-detailet {
    padding: 25px;
  }
  
  .payment-section {
    padding: 25px;
  }
  
  .payment-type {
    flex-direction: row;
    gap: 20px;
  }
  
  .payment-type li {
    flex: 1;
    flex-direction: column;
    gap: 12px;
    padding: 25px 20px;
    text-align: center;
  }
  
  .payment-type li img {
    height: 55px;
  }
  
  .payment-button {
    padding: 30px;
  }
  
  .payment-button button {
    height: 55px;
    font-size: 20px;
  }
}

@media (min-width: 1200px) {
  .content {
    max-width: 1000px;
    margin: 0 auto;
  }
}
</style>