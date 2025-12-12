<template>
  <div class="points-activity-page">
    <h1 class="title">积分抽奖</h1>
    
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

    <!-- 抽奖区域 -->
    <div class="lottery-container">
      <div class="lottery-header">
        <h2>幸运大转盘</h2>
        <p>支付50积分，赢取10-1000积分大奖！</p>
      </div>
      
      <!-- 转盘 -->
      <div class="wheel-container">
        <div class="wheel-grid">
          <div 
            v-for="(item, index) in prizeItems" 
            :key="index"
            class="prize-item"
            :class="{ 'highlight': currentHighlightIndex === index }"
            :style="{ background: item.color }"
          >
            <span class="prize-text">{{ item.displayText }}</span>
          </div>
        </div>
      </div>
      
      <!-- 抽奖按钮 -->
      <button class="lottery-btn" 
              @click="startLottery" 
              :disabled="isSpinning || points < 50">
        {{ isSpinning ? '抽奖中...' : '支付50积分抽奖' }}
      </button>
    </div>

    <!-- 中奖记录 -->
    <div class="records-section">
      <h3>最近中奖记录</h3>
      <div v-if="records.length === 0" class="empty-records">暂无中奖记录</div>
      <div v-else class="records-list">
        <div v-for="(record, index) in records" 
             :key="index" 
             class="record-item">
          <div class="record-time">{{ formatTime(record.createTime) }}</div>
          <div class="record-points" :class="record.points > 0 ? 'positive' : 'negative'">
            {{ record.points > 0 ? '+' : '' }}{{ record.points }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PointsActivity',
  data() {
    return {
      points: null,
      loading: false,
      isSpinning: false,
      currentHighlightIndex: -1,
      records: [],
      // 奖品配置（按概率排序）
      prizeItems: []
    };
  },
  computed: {
    displayPoints() {
      return this.points === null ? '--' : this.points;
    }
  },
  created() {
    this.initPrizeItems();
  },
  methods: {
    // 初始化奖品格子
    initPrizeItems() {
      // 创建36个格子（6x6网格）
      const items = [];
      
      // 按照概率分配奖项
      // 10积分：40% -> 14个格子
      for (let i = 0; i < 14; i++) {
        items.push({
          points: 10,
          color: '#4CAF50',
          displayText: '10'
        });
      }
      
      // 20积分：30% -> 11个格子
      for (let i = 0; i < 11; i++) {
        items.push({
          points: 20,
          color: '#2196F3',
          displayText: '20'
        });
      }
      
      // 50积分：15% -> 5个格子
      for (let i = 0; i < 5; i++) {
        items.push({
          points: 50,
          color: '#FF9800',
          displayText: '50'
        });
      }
      
      // 100积分：10% -> 4个格子
      for (let i = 0; i < 4; i++) {
        items.push({
          points: 100,
          color: '#9C27B0',
          displayText: '100'
        });
      }
      
      // 200积分：4% -> 1个格子
      items.push({
        points: 200,
        color: '#F44336',
        displayText: '200'
      });
      
      // 1000积分：1% -> 1个格子
      items.push({
        points: 1000,
        color: '#E91E63',
        displayText: '1k'
      });
      
      // 随机打乱顺序
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      
      this.prizeItems = items;
    },
    
    // 获取积分
    async fetchPoints() {
      this.loading = true;
      try {
        const res = await this.$axios.get('/api/points');
        const total = res && res.data && res.data.data && res.data.data.totalPoints;
        
        if (total === undefined || total === null) {
          this.points = 0;
        } else {
          const n = Number(total);
          this.points = Number.isNaN(n) ? total : n;
        }
      } catch (err) {
        console.error('fetchPoints error', err);
        this.points = 0;
      } finally {
        this.loading = false;
      }
    },
    
    // 开始抽奖
    async startLottery() {
      if (this.isSpinning || this.points < 50) return;
      
      this.isSpinning = true;
      let currentIndex = 0;
      
      // 创建定时器轮流高亮小方块
      const interval = setInterval(() => {
        this.currentHighlightIndex = currentIndex;
        currentIndex = (currentIndex + 1) % 36;
      }, 100);
      
      try {
        // 扣除50积分
        await this.$axios.patch('/api/points/shop/50');
        
        // 5秒后停止
        setTimeout(async () => {
          clearInterval(interval);
          
          // 随机选择一个中奖结果
          const prizeIndex = Math.floor(Math.random() * 36);
          this.currentHighlightIndex = prizeIndex;
          const prize = this.prizeItems[prizeIndex];
          
          // 添加获得的积分
          await this.$axios.patch(`/api/points/activity/${prize.points}`);
          
          // 更新积分
          await this.fetchPoints();
          
          // 添加到记录
          this.records.unshift({
            points: prize.points,
            createTime: new Date().toISOString()
          });
          
          // 限制记录数量
          if (this.records.length > 5) {
            this.records.pop();
          }
          
          // 显示中奖提示
          setTimeout(() => {
            alert(`恭喜您获得 ${prize.points} 积分！`);
          }, 500);
          
        }, 5000);
        
      } catch (err) {
        console.error('lottery error', err);
        clearInterval(interval);
        alert('抽奖失败，请重试');
      } finally {
        this.isSpinning = false;
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
.points-activity-page {
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

/* 抽奖区域样式 */
.lottery-container {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(31,138,112,0.06);
  margin-bottom: 24px;
  text-align: center;
}

.lottery-header h2 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #333;
}

.lottery-header p {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

/* 转盘容器 */
.wheel-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

/* 转盘网格 */
.wheel-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(6, 1fr);
  width: 320px;
  height: 320px;
  gap: 12px; /* 增加格子间距 */
  padding: 12px; /* 增加整体内边距 */
  background: #f5f5f5; /* 背景色 */
  border-radius: 12px;
}

/* 奖品格子 */
.prize-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.prize-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.prize-item.highlight {
  transform: scale(1.15);
  box-shadow: 0 0 20px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.6);
  z-index: 10;
}

.prize-text {
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* 抽奖按钮 */
.lottery-btn {
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.lottery-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.lottery-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 中奖记录 */
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

.record-time {
  font-size: 14px;
  color: #666;
}

.record-points {
  font-size: 16px;
  font-weight: 600;
}

.positive {
  color: #1f8a70;
}

.negative {
  color: #c0392b;
}
</style>
