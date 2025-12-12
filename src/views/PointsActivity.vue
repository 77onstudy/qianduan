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
          <div class="wheel" :style="{ transform: `rotate(${rotation}deg)` }">
            <div class="wheel-section" v-for="(prize, index) in prizes" 
                 :key="index"
                 :style="{ transform: `rotate(${prize.startAngle}deg)`, 
                          background: prize.color }">
              <div class="prize-text">{{ prize.points }}积分</div>
            </div>
            <div class="wheel-center"></div>
          </div>
          
          <!-- 指针 -->
          <div class="wheel-pointer"></div>
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
        rotation: 0,
        records: [],
        // 奖品配置（按概率排序）
        prizes: [
          { points: 10, probability: 40, color: '#4CAF50', startAngle: 0 },
          { points: 20, probability: 30, color: '#2196F3', startAngle: 144 },
          { points: 50, probability: 15, color: '#FF9800', startAngle: 252 },
          { points: 100, probability: 10, color: '#9C27B0', startAngle: 306 },
          { points: 200, probability: 4, color: '#F44336', startAngle: 342 },
          { points: 1000, probability: 1, color: '#E91E63', startAngle: 356.4 }
        ]
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
        
        try {
          // 扣除50积分
          await this.$axios.patch('/api/points/shop/50');
          
          // 根据概率计算中奖结果
          const prize = this.getRandomPrize();
          
          // 计算转盘旋转角度
          // 旋转多圈 + 目标位置的角度
          const extraRotations = 5; // 多转5圈
          const targetAngle = 360 - prize.startAngle - (360 / this.prizes.length / 2);
          const totalRotation = this.rotation + (360 * extraRotations) + targetAngle;
          
          // 设置旋转动画
          this.rotation = totalRotation;
          
          // 等待动画结束
          await new Promise(resolve => setTimeout(resolve, 5000));
          
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
          alert(`恭喜您获得 ${prize.points} 积分！`);
          
        } catch (err) {
          console.error('lottery error', err);
          alert('抽奖失败，请重试');
        } finally {
          this.isSpinning = false;
        }
      },
      
      // 根据概率获取奖品
      getRandomPrize() {
        const random = Math.random() * 100;
        let accumulated = 0;
        
        for (const prize of this.prizes) {
          accumulated += prize.probability;
          if (random <= accumulated) {
            return prize;
          }
        }
        
        // 默认返回最后一个奖品
        return this.prizes[this.prizes.length - 1];
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
    position: relative;
    width: 280px;
    height: 280px;
    margin: 0 auto 30px;
  }
  
  /* 转盘 */
  .wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    transition: transform 5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 0 10px #fff, 0 0 20px rgba(0,0,0,0.1);
  }
  
  /* 转盘扇形区域 */
  .wheel-section {
    position: absolute;
    width: 50%;
    height: 50%;
    transform-origin: right bottom;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .wheel-section:before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    border-radius: 50%;
    background: inherit;
    transform: rotate(30deg);
  }
  
  .prize-text {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(30deg);
    font-weight: bold;
    font-size: 16px;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
  
  /* 转盘中心 */
  .wheel-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    z-index: 10;
  }
  
  /* 指针 */
  .wheel-pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 30px solid #e74c3c;
    z-index: 20;
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
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
  