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
            <div class="wheel-body" :style="wheelStyle"></div>
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
      // 奖项配置
      prizeItems: [],
      // 转盘当前的旋转角度（累加值）
      rotateAngle: 0,
    };
  },
  computed: {
    displayPoints() {
      return this.points === null ? '--' : this.points;
    },
    // 生成圆锥渐变背景
    wheelBackground() {
      let gradientStr = 'conic-gradient(';
      this.prizeItems.forEach((item, index) => {
        // 每个扇区 45度 (360/8)
        // index 0: 0% - 12.5% (对应 0度 - 45度)
        const start = index * 12.5; 
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
        // 5秒动画，先慢后快再慢
        transition: this.isSpinning 
          ? 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' 
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
      // 这里对应 8 个扇区，index 0 到 7
      // 这里的颜色和位置是写死的，你可以随意改积分
      this.prizeItems = [
        { points: 0, displayText: '谢谢参与', color: '#CFD8DC' },
		{ points: 10, displayText: '10 积分', color: '#FFAB91' },   // Index 0
        { points: 20, displayText: '20 积分', color: '#FFE082' },   // Index 2
        { points: 50, displayText: '50 积分', color: '#80CBC4' }, // Index 3
        { points: 100, displayText: '100 积分', color: '#F48FB1' },   // Index 4
        { points: 200, displayText: '200 积分', color: '#9FA8DA' },   // Index 5
        { points: 500, displayText: '500 积分', color: '#CE93D8' }, // Index 6
        { points: 1000, displayText: '1000 积分', color: '#ff5c5f' } // Index 7
      ];
    },

    async startLottery() {
      if (this.isSpinning || this.points < 50) return;
      
      this.isSpinning = true;

      try {
        // 1. 先扣分
        await this.$axios.patch('/api/points/shop/50');
        
        // 2. 随机抽取一个索引 (0-7)
        // 这里完全随机，如果你想控制概率，可以改这里的逻辑
        const prizeIndex = Math.floor(Math.random() * 8); 
        const prize = this.prizeItems[prizeIndex];

        // 3. 计算旋转角度 (核心逻辑修改：简单粗暴版)
        // 目标：我们要让第 prizeIndex 个扇区转到最上面 (0度位置)
        // 每个扇区占 45度。
        // Index 0 的中心在 22.5度。要让它去 0度，需要转 -22.5度 (即 337.5度)。
        // Index 1 的中心在 67.5度。要让它去 0度，需要转 -67.5度 (即 292.5度)。
        
        // 公式：目标绝对角度 = 360 - (index * 45 + 22.5)
        const targetBaseAngle = 360 - (prizeIndex * 45 + 22.5);

        // 获取当前转盘已经转到的位置 (对360取余)
        const currentMod = this.rotateAngle % 360;

        // 计算我们还需要转多少度才能到达目标
        let rotationDiff = targetBaseAngle - currentMod;

        // 保证是顺时针转 (如果是负数，说明目标在当前位置后面，加上360绕一圈过去)
        if (rotationDiff < 0) {
          rotationDiff += 360;
        }

        // 加上额外的圈数 (5圈 = 1800度) 制造旋转效果
        // 最终角度 = 当前角度 + 还需要转的差值 + 多转的5圈
        this.rotateAngle += rotationDiff + (360 * 5);

        // 4. 等待动画结束 (5秒)
        setTimeout(async () => {
          // 结算
          if (prize.points > 0) {
            await this.$axios.patch(`/api/points/activity/${prize.points}`);
            alert(`恭喜！指针停在【${prize.displayText}】区，获得 ${prize.points} 积分！`);
          } else {
            alert('很遗憾，指针停在灰色区域，未中奖。');
          }
          
          await this.fetchPoints();
          
          this.records.unshift({
            points: prize.points,
            createTime: new Date().toISOString()
          });
          if (this.records.length > 5) this.records.pop();
          
          this.isSpinning = false;
        }, 5000); 

      } catch (err) {
        console.error(err);
        this.isSpinning = false;
        alert('网络错误或积分不足');
      }
    },
    
    async fetchPoints() {
      if(this.loading) return;
      this.loading = true;
      try {
        const res = await this.$axios.get('/api/points');
        // 针对你提供的后端格式: { "data": 2014.00, ... }
        if (res.data && res.data.success) {
          this.points = Number(res.data.data);
        } else {
          this.points = 0;
        }
      } catch (err) { 
        this.points = 0; 
      } finally { 
        this.loading = false; 
      }
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
  background: linear-gradient(135deg, #789a94, #5a7570);
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

/* --- 抽奖区域 --- */
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
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
}

/* 左侧转盘 */
.wheel-box {
  position: relative;
  width: 240px;
  height: 240px;
  flex-shrink: 0;
}

.wheel-border {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 8px solid #f0fdf9;
  box-shadow: 0 0 0 1px #e0e0e0, inset 0 0 10px rgba(0,0,0,0.1);
  box-sizing: border-box;
  overflow: hidden;
  position: relative; /* 确保子元素定位准确 */
}

.wheel-body {
  width: 100%; height: 100%;
  border-radius: 50%;
  /* 这里的背景由 JS 动态生成 */
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

/* 右侧图例 */
.legend-box {
  flex: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  min-width: 120px;
}
.legend-title { font-size: 12px; color: #64748b; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
.legend-list { display: flex; flex-direction: column; gap: 6px; }
.legend-item { display: flex; align-items: center; font-size: 12px; }
.color-dot { width: 12px; height: 12px; border-radius: 4px; margin-right: 8px; border: 1px solid rgba(0,0,0,0.1); }
.prize-name { color: #334155; flex: 1; }
.prize-tag { font-size: 10px; background: #fef3c7; color: #d97706; padding: 1px 4px; border-radius: 4px; transform: scale(0.9); }

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

@media (max-width: 480px) {
  .game-area { flex-direction: column; }
  .legend-box { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .legend-list { display: contents; }
  .legend-title { grid-column: 1 / -1; }
}
</style>