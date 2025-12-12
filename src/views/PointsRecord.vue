<template>
    <div class="points-record-page">
      <h1 class="title">积分流水</h1>
  
      <!-- 积分流水列表 -->
      <div class="record-list">
        <div v-if="loading" class="status">加载中...</div>
        <div v-else-if="error" class="status error">获取积分流水失败：{{ error }}</div>
        <div v-else-if="records.length === 0" class="status empty">暂无积分流水记录</div>
        <div v-else>
          <div 
            v-for="record in records" 
            :key="record.id" 
            class="record-item"
          >
            <div class="record-type">
              <span class="type-icon" :class="getTypeClass(record.transactionType)">
                {{ getTypeIcon(record.transactionType) }}
              </span>
              <div class="type-info">
                <div class="type-text">{{ getTypeText(record.transactionType) }}</div>
                <div class="record-description" v-if="record.description">
                  {{ record.description }}
                </div>
              </div>
            </div>
            <div class="record-points" :class="getPointsClass(record.transactionType)">
              {{ getDisplayPoints(record.transactionType, record.points) }}
            </div>
            <div class="record-time">{{ formatTime(record.transactionTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PointsRecord',
    data() {
      return {
        records: [],
        loading: false,
        error: null,
      };
    },
    methods: {
      // 获取积分流水记录
      async fetchRecords() {
        this.loading = true;
        this.error = null;
        try {
          const res = await this.$axios.get('/api/points/details');
          
          // 处理返回数据
          if (res.data && res.data.success) {
            // 处理流水记录
            if (res.data.data && Array.isArray(res.data.data)) {
              this.records = res.data.data.map(record => ({
                ...record,
                // 根据类型确定积分正负
                points: this.getTransactionPoints(record.transactionType, record.points)
              }));
            } else {
              this.records = [];
            }
          } else {
            this.error = res.data?.message || '获取数据失败';
            this.records = [];
          }
        } catch (err) {
          console.error('fetchRecords error', err);
          this.error = err?.message || '网络或服务器错误';
          this.records = [];
        } finally {
          this.loading = false;
        }
      },
      
      // 根据交易类型确定积分正负
      getTransactionPoints(type, points) {
        // 1和2是获得积分（正数），其他是减少积分（负数）
        return [1, 2].includes(type) ? Math.abs(points) : -Math.abs(points);
      },
      
      // 获取显示的积分值（带符号）
      getDisplayPoints(type, points) {
        const absPoints = Math.abs(points);
        return [1, 2].includes(type) ? `+${absPoints}` : `-${absPoints}`;
      },
      
      // 获取积分变化的样式类
      getPointsClass(type) {
        return [1, 2].includes(type) ? 'positive' : 'negative';
      },
      
      // 获取交易类型对应的图标
      getTypeIcon(type) {
        const icons = {
          1: '🛒',  // 订单获得
          2: '🎯',  // 活动（转盘获得）
          3: '💳',  // 订单使用
          4: '⏰',  // 积分过期
          5: '🛍️'   // 商城使用
        };
        return icons[type] || '❓';
      },
      
      // 获取交易类型对应的文本
      getTypeText(type) {
        const texts = {
          1: '订单获得',
          2: '活动获得',
          3: '订单使用',
          4: '积分过期',
          5: '商城使用'
        };
        return texts[type] || '其他';
      },
      
      // 获取交易类型对应的样式类
      getTypeClass(type) {
        const classes = {
          1: 'earn',
          2: 'activity',
          3: 'use',
          4: 'expire',
          5: 'shop'
        };
        return classes[type] || 'other';
      },
      
      // 格式化时间
      formatTime(timeStr) {
        if (!timeStr) return '';
        try {
          // 尝试解析ISO格式时间
          const date = new Date(timeStr);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
          // 如果不是ISO格式，直接返回
          return timeStr;
        } catch (e) {
          return timeStr;
        }
      }
    },
    mounted() {
      this.fetchRecords();
    }
  };
  </script>
  
  <style scoped>
  .points-record-page {
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
  
  /* 积分流水列表样式 */
  .record-list {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 6px 18px rgba(31,138,112,0.06);
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
  
  .record-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .record-item:last-child {
    border-bottom: none;
  }
  
  .record-type {
    flex: 1;
    display: flex;
    align-items: flex-start;
  }
  
  .type-icon {
    font-size: 24px;
    margin-right: 12px;
    width: 32px;
    text-align: center;
    flex-shrink: 0;
  }
  
  .type-info {
    flex: 1;
  }
  
  .type-text {
    font-size: 16px;
    color: #333;
    font-weight: 500;
  }
  
  .record-description {
    font-size: 14px;
    color: #888;
    margin-top: 4px;
  }
  
  .record-points {
    font-size: 18px;
    font-weight: 600;
    width: 80px;
    text-align: right;
    flex-shrink: 0;
  }
  
  .positive {
    color: #1f8a70;
  }
  
  .negative {
    color: #c0392b;
  }
  
  .record-time {
    font-size: 14px;
    color: #888;
    width: 120px;
    text-align: right;
    flex-shrink: 0;
  }
  
  /* 不同交易类型的样式 */
  .type-icon.earn {
    color: #1f8a70;
  }
  
  .type-icon.activity {
    color: #3498db;
  }
  
  .type-icon.use {
    color: #e74c3c;
  }
  
  .type-icon.expire {
    color: #f39c12;
  }
  
  .type-icon.shop {
    color: #9b59b6;
  }
  </style>
  