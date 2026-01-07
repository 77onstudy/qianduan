<template>
  <div class="points-activity-page">
    <h1 class="title">幸运抽奖中心</h1>
    
    <div class="dashboard-card">
      <div class="coin-wrapper">
        <div class="coin-icon">🪙</div>
      </div>
      <div class="points-info">
        <span class="label">我的当前积分</span>
        <span class="value">{{ displayPoints }}</span>
      </div>
      <button class="refresh-btn" @click="fetchPoints" :disabled="loading">
        {{ loading ? '...' : '刷新' }}
      </button>
    </div>

    <div class="lottery-section">
      <div class="lottery-header">
        <h2>积分大转盘</h2>
        <p>消耗 <span class="cost">50</span> 积分 / 次</p>
      </div>
      
      <div class="game-area">
        <div class="wheel-box">
          <div class="wheel-border">
            <div class="wheel-body" :style="wheelStyle">
              </div>
          </div>
          <div class="pointer-container">
            <div class="pointer-arrow"></div>
            <button class="go-btn" @click="startLottery" :disabled="isSpinning || points < 50">
              GO
            </button>
          </div>
        </div>

        <div class="legend-box">
          <div class="legend-title">奖项说明</div>
          <div class="legend-list">
            <div v-for="(item, index) in prizeItems" :key="index" class="legend-item">
              <span class="color-dot" :style="{ background: item.color }"></span>
              <span class="prize-name">{{ item.displayText }}</span>
              <span class="prize-tag" v-if="item.points >= 100">大奖</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="records-card">
      <div class="card-header-line">
        <h3>中奖记录</h3>
        <span class="subtitle">最近5条</span>
      </div>
      <div class="records-list">
        <div v-if="records.length === 0" class="empty-state">暂无记录，快去试试手气！</div>
        <div v-for="(record, index) in records" :key="index" class="record-row">
          <span class="time">{{ formatTime(record.createTime) }}</span>
          <div class="result" :class="getPointsClass(record.points)">
            <span class="label">{{ record.points > 0 ? '中奖' : '遗憾' }}</span>
            <span class="num" v-if="record.points > 0">+{{ record.points }}</span>
            <span class="num" v-else>0</span>
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
      records: [],
      // 8个扇区配置 (注意颜色搭配)
      prizeItems: [],
      rotateAngle: 0,
    };
  },
  computed: {
    displayPoints() {
      return this.points === null ? '--' : this.points;
    },
    // 动态生成圆锥渐变背景
    wheelBackground() {
      // 这里的逻辑是将 prizeItems 里的颜色拼接成 CSS conic-gradient 字符串
      // 例如: conic-gradient(#red 0% 12.5%, #blue 12.5% 25%, ...)
      let gradientStr = 'conic-gradient(';
      this.prizeItems.forEach((item, index) => {
        const start = index * 12.5; // 100% / 8 = 12.5%
        const end = (index + 1) * 12.5;
        gradientStr += `${item.color} ${start}% ${end}%`;
        if (index < this.prizeItems.length - 1) gradientStr += ', ';
      });
      gradientStr += ')';
      return gradientStr;
    },
    wheelStyle() {
      return {
        background: this.wheelBackground,
        transform: `rotate(${this.rotateAngle}deg)`,
        transition: this.isSpinning 
          ? 'transform 4s cubic-bezier(0.2, 0.8, 0.1, 1)' // 顺滑的物理减速效果
          : 'none'
      };
    }
  },
  created() {
    this.initPrizeItems();
  },
  mounted() {
    this.fetchPoints();
  },
  methods: {
    initPrizeItems() {
      // 定义8个奖项和对应的颜色
      // 颜色选取了比较柔和但区分度高的色板
      this.prizeItems = [
        { points: 10, displayText: '10 积分', color: '#FFAB91' },   // 浅红
        { points: 0, displayText: '谢谢参与', color: '#CFD8DC' },    // 灰色
        { points: 20, displayText: '20 积分', color: '#FFE082' },   // 浅橙
        { points: 100, displayText: '100 积分', color: '#80CBC4' }, // 青色
        { points: 10, displayText: '10 积分', color: '#F48FB1' },   // 粉色
        { points: 50, displayText: '50 积分', color: '#9FA8DA' },   // 浅紫
        { points: 200, displayText: '200 积分', color: '#CE93D8' }, // 紫色
        { points: 1000, displayText: '1000 积分', color: '#FFCC80' } // 金色
      ];
    },

    async startLottery() {
      if (this.isSpinning || this.points < 50) return;
      
      this.isSpinning = true;

      try {
        await this.$axios.patch('/api/points/shop/50');
        
        // 随机选择结果
        const prizeIndex = Math.floor(Math.random() * 8);
        const prize = this.prizeItems[prizeIndex];

        // 计算旋转角度
        // 1. 基础旋转 6 圈 (360 * 6)
        // 2. 目标偏移: 360 - (index * 45) -> 让扇区起始线对准0度
        // 3. 居中修正: - 22.5 -> 让指针指在扇区中间
        const basicRotate = 360 * 6;
        const targetOffset = 360 - (prizeIndex * 45);
        const centerCorrection = -22.5;

        this.rotateAngle = this.rotateAngle + basicRotate + targetOffset + centerCorrection;

        // 动画结束回调
        setTimeout(async () => {
          if (prize.points > 0) {
            await this.$axios.patch(`/api/points/activity/${prize.points}`);
            alert(`恭喜！指针停在【${prize.displayText}】区，获得 ${prize.points} 积分！`);
          } else {
            alert('指针停在灰色区域，很遗憾未中奖，下次好运！');
          }
          
          await this.fetchPoints();
          
          this.records.unshift({
            points: prize.points,
            createTime: new Date().toISOString()
          });
          if (this.records.length > 5) this.records.pop();
          
          this.isSpinning = false;
        }, 4000); // 必须与 CSS transition 时间一致

      } catch (err) {
        console.error(err);
        this.isSpinning = false;
        alert('网络错误，请稍后重试');
      }
    },
    
    async fetchPoints() {
      if(this.loading) return;
      this.loading = true;
      try {
        const res = await this.$axios.get('/api/points');
        const total = res?.data?.data?.totalPoints;
        this.points = (total !== undefined && total !== null) ? Number(total) : 0;
      } catch (err) { this.points = 0; } finally { this.loading = false; }
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      const d = new Date(timeStr);
      return `${d.getMonth()+1}-${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    },

    getPointsClass(points) {
      if (points >= 100) return 'win-big';
      if (points > 0) return 'win-small';
      return 'loose';
    }
  }
};
</script>

<style scoped>
.points-activity-page {
  max-width: 600px;
  margin: 20px auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
}

.title { text-align: center; color: #789a94; font-weight: 800; margin-bottom: 24px; }

/* 积分面板 */
.dashboard-card {
  background: linear-gradient(135deg, #789a94, #789a94);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(31,138,112,0.3);
  margin-bottom: 30px;
}
.coin-wrapper { background: rgba(255,255,255,0.2); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
.coin-icon { font-size: 24px; }
.points-info { flex: 1; }
.points-info .label { font-size: 12px; opacity: 0.8; display: block; margin-bottom: 4px; }
.points-info .value { font-size: 28px; font-weight: bold; font-family: monospace; }
.refresh-btn {
  background: transparent; border: 1px solid rgba(255,255,255,0.4); color: #fff;
  padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 12px;
  transition: all 0.2s;
}
.refresh-btn:hover { background: rgba(255,255,255,0.1); }

/* --- 抽奖区域 (核心布局) --- */
.lottery-section { 
  background: #fff; 
  border-radius: 16px; 
  padding: 24px; 
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  margin-bottom: 24px;
}

.lottery-header { text-align: center; margin-bottom: 20px; }
.lottery-header h2 { font-size: 18px; margin: 0 0 6px; color: #333; }
.cost { color: #f59e0b; font-weight: bold; }

.game-area {
  display: flex;
  flex-direction: row; /* 左右排列 */
  align-items: center;
  justify-content: space-around;
  gap: 20px;
}

/* 1. 左侧转盘 */
.wheel-box {
  position: relative;
  width: 240px;
  height: 240px;
  flex-shrink: 0; /* 防止被压缩 */
}

.wheel-border {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 8px solid #f0fdf9; /* 外圈装饰色 */
  box-shadow: 0 0 0 1px #e0e0e0, inset 0 0 10px rgba(0,0,0,0.1);
  box-sizing: border-box;
  overflow: hidden;
}

.wheel-body {
  width: 100%; height: 100%;
  border-radius: 50%;
  /* 这里的 background 由 computed 属性 wheelBackground 动态生成 */
}

/* 指针 */
.pointer-container {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.pointer-arrow {
  position: absolute;
  top: -24px; left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 26px solid #ef4444; /* 红色指针 */
}
.go-btn {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: #ef4444;
  border: 3px solid #fff;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  transition: transform 0.1s;
}
.go-btn:active:not(:disabled) { transform: scale(0.95); }
.go-btn:disabled { background: #b0b0b0; cursor: not-allowed; }

/* 2. 右侧图例 */
.legend-box {
  flex: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  min-width: 120px;
}
.legend-title { font-size: 12px; color: #64748b; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.color-dot {
  width: 12px; height: 12px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid rgba(0,0,0,0.1);
}

.prize-name { color: #334155; flex: 1; }
.prize-tag {
  font-size: 10px;
  background: #fef3c7;
  color: #d97706;
  padding: 1px 4px;
  border-radius: 4px;
  transform: scale(0.9);
}

/* 记录列表 */
.records-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.card-header-line { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
.card-header-line h3 { margin: 0; font-size: 15px; color: #333; }
.subtitle { font-size: 12px; color: #999; }

.record-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
.time { color: #94a3b8; }
.result { display: flex; gap: 6px; font-weight: 500; }
.win-big { color: #ef4444; }
.win-small { color: #1f8a70; }
.loose { color: #94a3b8; }
.empty-state { text-align: center; color: #cbd5e1; padding: 10px 0; font-size: 12px; }

/* 移动端适配：竖排 */
@media (max-width: 480px) {
  .game-area {
    flex-direction: column;
  }
  .legend-box {
    width: 100%;
    display: grid;
    /* 移动端图例变两列 */
    grid-template-columns: 1fr 1fr; 
    gap: 8px;
  }
  .legend-list { display: contents; } /* 让grid直接作用于item */
  .legend-title { grid-column: 1 / -1; }
}
</style>