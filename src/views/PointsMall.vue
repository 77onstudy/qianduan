<template>
    <div class="points-shop-page">
      <h1 class="title">积分商城</h1>
  
      <!-- 当前积分卡片 -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">当前积分</div>
          <div class="card-value">{{ displayPoints }}</div>
        </div>
        <div class="card-footer">
          <button class="btn" @click="fetchPoints" :disabled="loading">刷新</button>
        </div>
      </div>
  
      <!-- 商品列表 -->
      <div class="products-container">
        <div v-if="loading" class="status">加载中...</div>
        <div v-else-if="error" class="status error">获取商品失败：{{ error }}</div>
        <div v-else-if="products.length === 0" class="status empty">暂无商品</div>
        <div v-else class="products-grid">
          <div 
            v-for="product in products" 
            :key="product.id" 
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name">
              <div v-if="product.stock === 0" class="out-of-stock">已售罄</div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-footer">
                <div class="product-points">
                  <span class="points-label">所需积分：</span>
                  <span class="points-value">{{ product.points }}</span>
                </div>
                <div class="product-stock">
                  库存：{{ product.stock }}
                </div>
                <button 
                  class="exchange-btn" 
                  @click="exchangeProduct(product)"
                  :disabled="isExchanging || points < product.points || product.stock === 0"
                >
                  {{ isExchanging ? '兑换中...' : '立即兑换' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 兑换记录 -->
      <div class="records-section">
        <h3>最近兑换记录</h3>
        <div v-if="records.length === 0" class="empty-records">暂无兑换记录</div>
        <div v-else class="records-list">
          <div v-for="(record, index) in records" 
               :key="index" 
               class="record-item">
            <div class="record-product">{{ record.productName }}</div>
            <div class="record-points negative">-{{ record.points }}</div>
            <div class="record-time">{{ formatTime(record.exchangeTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PointsShop',
    data() {
      return {
        points: null,
        loading: false,
        error: null,
        isExchanging: false,
        products: [
          {
            id: 1,
            name: '10元代金券',
            description: '可用于商城任意商品抵扣10元',
            points: 100,
            image: 'https://via.placeholder.com/200x200?text=10元代金券',
            stock: 50
          },
          {
            id: 2,
            name: '20元代金券',
            description: '可用于商城任意商品抵扣20元',
            points: 200,
            image: 'https://via.placeholder.com/200x200?text=20元代金券',
            stock: 30
          },
          {
            id: 3,
            name: '50元代金券',
            description: '可用于商城任意商品抵扣50元',
            points: 500,
            image: 'https://via.placeholder.com/200x200?text=50元代金券',
            stock: 20
          },
          {
            id: 4,
            name: '100元代金券',
            description: '可用于商城任意商品抵扣100元',
            points: 1000,
            image: 'https://via.placeholder.com/200x200?text=100元代金券',
            stock: 10
          },
          {
            id: 5,
            name: '精美笔记本',
            description: '高品质笔记本，适合办公学习',
            points: 300,
            image: 'https://via.placeholder.com/200x200?text=精美笔记本',
            stock: 15
          },
          {
            id: 6,
            name: '保温杯',
            description: '304不锈钢保温杯，保温12小时',
            points: 800,
            image: 'https://via.placeholder.com/200x200?text=保温杯',
            stock: 8
          },
          {
            id: 7,
            name: '蓝牙耳机',
            description: '高音质蓝牙耳机，续航24小时',
            points: 2000,
            image: 'https://via.placeholder.com/200x200?text=蓝牙耳机',
            stock: 5
          },
          {
            id: 8,
            name: '智能手环',
            description: '健康监测，运动追踪，防水设计',
            points: 1500,
            image: 'https://via.placeholder.com/200x200?text=智能手环',
            stock: 3
          }
        ],
        records: []
      };
    },
    computed: {
      displayPoints() {
        return this.points === null ? '--' : this.points;
      }
    },
    methods: {
      // 获取积分
      async fetchPoints() {
        this.loading = true;
        this.error = null;
        try {
          const res = await this.$axios.get('/api/points');
  
          // 严格按你规定的结构读取 data.data.totalPoints
          const total = res && res.data && res.data.data && res.data.data.totalPoints;
  
          if (total === undefined || total === null) {
            this.points = 0;
            this.error = '后端返回缺少 data.data.totalPoints';
          } else {
            const n = Number(total);
            this.points = Number.isNaN(n) ? total : n;
          }
        } catch (err) {
          console.error('fetchPoints error', err);
          this.error = err?.message || '网络或服务器错误';
          if (this.points === null) this.points = 0;
        } finally {
          this.loading = false;
        }
      },
      
      // 兑换商品
      async exchangeProduct(product) {
        if (this.isExchanging || this.points < product.points || product.stock === 0) return;
        
        this.isExchanging = true;
        
        try {
          // 扣减积分
          await this.$axios.post(`/api/points/shop/${product.points}`);
          
          // 更新商品库存（前端模拟）
          const productIndex = this.products.findIndex(p => p.id === product.id);
          if (productIndex !== -1) {
            this.products[productIndex].stock -= 1;
          }
          
          // 更新积分
          await this.fetchPoints();
          
          // 添加兑换记录
          this.records.unshift({
            productName: product.name,
            points: product.points,
            exchangeTime: new Date().toISOString()
          });
          
          // 限制记录数量
          if (this.records.length > 5) {
            this.records.pop();
          }
          
          // 显示成功提示
          alert(`成功兑换 ${product.name}！`);
          
        } catch (err) {
          console.error('exchange error', err);
          const errorMsg = err?.response?.data?.message || err?.message || '兑换失败，请重试';
          
          // 处理特定错误
          if (errorMsg.includes('积分不足')) {
            alert('积分不足，无法兑换！');
          } else if (errorMsg.includes('库存不足')) {
            alert('商品库存不足，请选择其他商品！');
          } else {
            alert(`兑换失败：${errorMsg}`);
          }
        } finally {
          this.isExchanging = false;
        }
      },
      
      // 格式化时间
      formatTime(timeStr) {
        if (!timeStr) return '';
        try {
          const date = new Date(timeStr);
          return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (e) {
          return timeStr;
        }
      }
    },
    mounted() {
      this.fetchPoints();
    }
  };
  </script>
  
  <style scoped>
  .points-shop-page {
    max-width: 720px;
    margin: 36px auto;
    padding: 18px;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  
  .title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 24px;
  }
  
  /* 积分卡片样式 */
  .card {
    background: #fff;
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0 6px 18px rgba(31,138,112,0.06);
    margin-bottom: 24px;
  }
  
  .card-header {
    text-align: center;
    margin-bottom: 16px;
  }
  
  .card-title {
    font-size: 16px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .card-value {
    font-size: 40px;
    font-weight: 800;
    color: #1f8a70;
  }
  
  .card-footer {
    text-align: center;
    margin-top: 16px;
  }
  
  .btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #1f8a70;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
  }
  
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* 商品列表样式 */
  .products-container {
    margin-bottom: 24px;
  }
  
  .status {
    text-align: center;
    padding: 40px 0;
    font-size: 16px;
    color: #666;
  }
  
  .status.error {
    color: #c0392b;
  }
  
  .status.empty {
    color: #888;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .product-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }
  
  .product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .out-of-stock {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
  }
  
  .product-info {
    padding: 16px;
  }
  
  .product-name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }
  
  .product-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .product-footer {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .product-points {
    display: flex;
    align-items: center;
    font-size: 16px;
  }
  
  .points-label {
    color: #666;
  }
  
  .points-value {
    font-weight: 700;
    color: #e74c3c;
    font-size: 18px;
    margin-left: 5px;
  }
  
  .product-stock {
    font-size: 14px;
    color: #666;
  }
  
  .exchange-btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: #1f8a70;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  
  .exchange-btn:hover:not(:disabled) {
    background: #16a085;
  }
  
  .exchange-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  /* 兑换记录样式 */
  .records-section {
    background: #fff;
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0 6px 18px rgba(31,138,112,0.06);
  }
  
  .records-section h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #333;
  }
  
  .empty-records {
    text-align: center;
    color: #999;
    padding: 20px 0;
  }
  
  .records-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .record-item:last-child {
    border-bottom: none;
  }
  
  .record-product {
    flex: 1;
    font-size: 14px;
    color: #333;
  }
  
  .record-points {
    font-size: 16px;
    font-weight: 600;
    color: #e74c3c;
  }
  
  .record-time {
    font-size: 14px;
    color: #666;
  }
  </style>
  