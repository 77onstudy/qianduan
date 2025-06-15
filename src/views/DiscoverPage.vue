<template>
    <div class="app-container">
      <!-- 顶部栏 -->
      <div class="top-banner">
        <div class="top-banner-content">
          <h1>爆红包</h1>
          <p class="subtitle">折扣超百亿 爆涨得18.8红包</p>
        </div>
      </div>
  
      <!-- 我的红包区域 -->
      <div class="my-red-packets">
        <div class="header">
          <span class="title">我的3张红包&gt;</span>
          <span class="saved-amount">已省{{ savedMoney }}元</span>
        </div>
        
        <div class="packets-container">
          <!-- 红包1 -->
          <div class="red-packet">
            <div class="packet-type">可爆红包</div>
            <div class="amount">￥3</div>
            <div class="condition">满35可用</div>
            <button class="action-btn">立即爆涨</button>
            <div class="expiry">今日到期</div>
          </div>
          
          <!-- 红包2 -->
          <div class="red-packet">
            <div class="packet-type">夜宵美食爆红包</div>
            <div class="amount">￥10</div>
            <div class="condition">满30可用</div>
            <button class="action-btn">去使用</button>
            <div class="expiry">今日到期</div>
          </div>
          
          <!-- 红包3 -->
          <div class="red-packet">
            <div class="packet-type">超级美食爆红包</div>
            <div class="amount">￥9</div>
            <div class="condition">满25可用</div>
            <button class="action-btn">立即爆涨</button>
            <div class="expiry">今日到期</div>
          </div>
        </div>
      </div>
  
      <!-- 活动区域 -->
      <div class="event-banner" @click="showPacket">
        <div class="event-content">
          <div class="amount-highlight">￥{{ currentAmount.toFixed(1) }}</div>
          <div class="event-text">活动期间，参与极限爆涨必得18.8元红包</div>
          <div class="action-link">去爆涨&gt;</div>
        </div>
      </div>
  
      <!-- 天天领红包区域 -->
      <div class="daily-packets">
        <div class="section-title">
          <span>天天领红包</span>
          <span class="time-info">周五六日8/10/14/17/20点限量抢</span>
        </div>
        
        <div class="daily-container">
          <div class="daily-packet">
            <div class="packet-type">爆红包</div>
            <div class="amount">￥10</div>
            <div class="condition">满34可用</div>
            <button class="free-btn">免费领</button>
          </div>
          
          <div class="daily-packet">
            <div class="packet-type">城市零售专...</div>
            <div class="amount">￥6</div>
            <div class="condition">满30可用</div>
            <button class="free-btn">免费领</button>
          </div>
          
          <div class="daily-packet">
            <div class="packet-type">爆红包</div>
            <div class="amount">￥5</div>
            <div class="condition">满25可用</div>
            <button class="free-btn">免费领</button>
          </div>
          
          <div class="daily-packet">
            <div class="packet-type">可爆红包</div>
            <div class="amount">￥2</div>
            <div class="condition">满35可用</div>
            <button class="free-btn">免费领</button>
          </div>
        </div>
      </div>
  
      <!-- 吃货卡区域 -->
      <div class="foodie-card">
        <div class="section-title">购买超级吃货卡 使用范围</div>
        <div class="usage-info">爆红包商家专享</div>
        
        <div class="card-container">
          <div class="card-details">
            <div class="card-benefit">5元×6张</div>
            <div class="card-condition">无门槛</div>
            <div class="card-highlight">最高爆涨至66元</div>
          </div>
          
          <div class="card-price">
            <div class="discount">惊喜折扣0.8折</div>
            <div class="original-price">￥18</div>
            <div class="current-price">￥1.5</div>
            <button class="buy-btn">抢购</button>
          </div>
        </div>
        
        <div class="card-notes">
          <span>31天内有效</span>|
          <span>购买即视为同意服务协议</span>|
          <span>超吃卡权益说明相关协议</span>
        </div>
        
        <div class="purchase-link">购买记录&gt;</div>
      </div>
  
      <!-- 底部导航栏 -->
      <NavFooter />
  
      <!-- 红包弹窗 -->
      <div class="packet-modal" v-if="showModal">
        <div class="modal-content">
          <div class="big-red-packet" :class="{ 'exploded': isExploded }">
            <div class="big-packet-body">
              <div class="packet-content">
                <div class="packet-circle" @click="revealAmount" v-if="!isExploded">
                  <div class="packet-text">拆</div>
                </div>
                <div class="packet-amount" v-if="isExploded">
                  <div class="congrats">恭喜获得</div>
                  <div class="final-amount">¥{{ finalAmount.toFixed(1) }}</div>
                  <div class="exploded-tag">已爆涨</div>
                  <button class="use-now">立即使用</button>
                </div>
              </div>
            </div>
          </div>
          <div class="close-modal" @click="closeModal">×</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import NavFooter from '@/components/NavFooter.vue';
  
  export default {
    name: 'DiscoverPage',
    components: {
      NavFooter
    },
    setup() {
      const showModal = ref(false);
      const isExploded = ref(false);
      const finalAmount = ref(18.8);
      const currentAmount = ref(18.8);
      const savedMoney = ref(0);
      
      const showPacket = () => {
        showModal.value = true;
        isExploded.value = false;
      };
  
      const revealAmount = () => {
        const increaseAmount = Math.floor(Math.random() * 7) + 2;
        finalAmount.value = 18.8 + increaseAmount;
        isExploded.value = true;
        
        setTimeout(() => {
          const interval = setInterval(() => {
            if (currentAmount.value < finalAmount.value) {
              currentAmount.value += 0.5;
              savedMoney.value = Math.floor(currentAmount.value - 18.8);
            } else {
              clearInterval(interval);
            }
          }, 50);
        }, 300);
      };
  
      const closeModal = () => {
        showModal.value = false;
        currentAmount.value = finalAmount.value;
      };
  
      return {
        showModal,
        isExploded,
        finalAmount,
        currentAmount,
        savedMoney,
        showPacket,
        revealAmount,
        closeModal
      };
    }
  };
  </script>
  
  <style scoped>
  /* 基础样式 */
  .app-container {
    font-family: 'PingFang SC', -apple-system, sans-serif;
    background-color: #fffaf7;
    padding-bottom: 70px;
    min-height: 100vh;
  }
  
  /* 顶部栏 */
  .top-banner {
    background: linear-gradient(to right, #FFC0CB, #FF69B4);
    color: #d81e06;
    padding: 15px 15px 5px;
    box-shadow: 0 2px 8px rgba(255, 105, 180, 0.2);
    border-radius: 0 0 20px 20px;
    position: relative;
    z-index: 10;
  }
  
  .top-banner-content {
    position: relative;
  }
  
  .top-banner h1 {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    margin: 15px 0 5px;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .subtitle {
    font-size: 14px;
    text-align: center;
    margin: 0;
    color: #fff;
    font-weight: 500;
    padding-bottom: 10px;
  }
  
  /* 我的红包区域 */
  .my-red-packets {
    padding: 15px;
    margin-top: 10px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
  
  .saved-amount {
    font-size: 14px;
    color: #e02e41;
    font-weight: 500;
  }
  
  .packets-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }
  
  .red-packet {
    background: linear-gradient(135deg, #ffefef, #ffeaea);
    border-radius: 10px;
    padding: 12px 8px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    position: relative;
    overflow: hidden;
    border: 1px solid #ffeeee;
    transition: transform 0.3s ease;
  }
  
  .red-packet:hover {
    transform: translateY(-3px);
  }
  
  .packet-type {
    font-size: 13px;
    color: #e02e41;
    margin-bottom: 5px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .amount {
    font-size: 22px;
    font-weight: bold;
    color: #e02e41;
    margin: 8px 0;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .condition {
    font-size: 12px;
    color: #999;
    margin-bottom: 10px;
  }
  
  .action-btn {
    background: linear-gradient(to right, #e02e41, #ff4d64);
    color: white;
    border: none;
    width: 100%;
    padding: 6px 0;
    border-radius: 15px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .action-btn:hover {
    opacity: 0.9;
    transform: scale(0.98);
  }
  
  .expiry {
    font-size: 10px;
    color: #e02e41;
    margin-top: 8px;
    font-weight: 500;
  }
  
  /* 活动区域 */
  .event-banner {
    background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
    margin: 15px;
    border-radius: 12px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .event-banner:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(255, 107, 107, 0.4);
  }
  
  .event-content {
    position: relative;
    z-index: 1;
  }
  
  .amount-highlight {
    font-size: 32px;
    font-weight: bold;
    color: #ffff00;
    text-shadow: 0 0 6px rgba(0,0,0,0.3);
    transition: all 0.5s ease;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .event-text {
    font-size: 15px;
    color: #fff;
    margin: 8px 0 12px;
    font-weight: 500;
  }
  
  .action-link {
    display: inline-block;
    background: rgba(255,255,255,0.2);
    color: #ffff00;
    padding: 6px 20px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 15px;
    transition: all 0.3s ease;
  }
  
  .action-link:hover {
    background: rgba(255,255,255,0.3);
  }
  
  /* 天天领红包区域 */
  .daily-packets {
    padding: 15px;
    background: white;
    border-radius: 15px;
    margin: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
  }
  
  .time-info {
    font-size: 12px;
    color: #999;
  }
  
  .daily-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 10px;
  }
  
  .daily-packet {
    background: #fff9f9;
    border-radius: 10px;
    padding: 10px 5px;
    text-align: center;
    border: 1px solid #ffefef;
    transition: all 0.3s ease;
  }
  
  .daily-packet:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .free-btn {
    background: linear-gradient(to right, #ff9500, #ffaa33);
    color: white;
    border: none;
    width: 100%;
    padding: 5px 0;
    border-radius: 15px;
    font-size: 13px;
    margin-top: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .free-btn:hover {
    opacity: 0.9;
  }
  
  /* 吃货卡区域 */
  .foodie-card {
    padding: 15px;
    background: white;
    border-radius: 15px;
    margin: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .usage-info {
    font-size: 14px;
    color: #999;
    margin: 10px 0 15px;
  }
  
  .card-container {
    display: flex;
    justify-content: space-between;
    background: #fffaf0;
    border-radius: 10px;
    padding: 15px;
    border: 1px solid #ffeecc;
  }
  
  .card-details {
    text-align: left;
  }
  
  .card-benefit {
    font-size: 18px;
    font-weight: bold;
    color: #e02e41;
  }
  
  .card-condition {
    font-size: 13px;
    color: #666;
    margin: 8px 0;
  }
  
  .card-highlight {
    font-size: 14px;
    color: #ff9500;
    font-weight: 500;
  }
  
  .card-price {
    position: relative;
    text-align: right;
  }
  
  .discount {
    font-size: 12px;
    color: #e02e41;
    font-weight: bold;
  }
  
  .original-price {
    font-size: 12px;
    color: #999;
    text-decoration: line-through;
    margin: 5px 0;
  }
  
  .current-price {
    font-size: 24px;
    font-weight: bold;
    color: #e02e41;
  }
  
  .buy-btn {
    background: linear-gradient(to right, #e02e41, #ff4d64);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 500;
    margin-top: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .buy-btn:hover {
    opacity: 0.9;
    transform: scale(0.98);
  }
  
  .card-notes {
    display: flex;
    justify-content: center;
    font-size: 11px;
    color: #999;
    margin: 15px 0;
    gap: 5px;
    flex-wrap: wrap;
  }
  
  .purchase-link {
    text-align: center;
    font-size: 14px;
    color: #666;
    font-weight: 500;
    margin-top: 10px;
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .purchase-link:hover {
    color: #e02e41;
  }
  
  /* 红包弹窗样式 */
  .packet-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    width: 90%;
    max-width: 300px;
    position: relative;
  }
  
  .big-red-packet {
    width: 280px;
    height: 380px;
    background: #e02e41;
    border-radius: 12px;
    position: relative;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  }
  
  .big-red-packet.exploded {
    animation: pulse 0.5s ease;
  }
  
  .big-packet-body {
    height: 330px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .packet-circle {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #f8e71c, #f5a623);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px auto 0;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: float 2s ease-in-out infinite;
  }
  
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }
  
  .packet-circle:hover {
    transform: scale(1.05) translateY(-5px);
  }
  
  .packet-circle:active {
    transform: scale(0.98);
  }
  
  .packet-text {
    font-size: 28px;
    color: #b32512;
    font-weight: bold;
    text-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  
  .packet-amount {
    text-align: center;
    margin-top: 20px;
    animation: slideUp 0.5s ease;
  }
  
  .congrats {
    font-size: 20px;
    color: #ffff00;
    margin-bottom: 10px;
    font-weight: bold;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  
  .final-amount {
    font-size: 42px;
    font-weight: bold;
    color: #f8e71c;
    text-shadow: 0 0 6px rgba(0,0,0,0.5);
    transition: all 0.3s ease;
    margin: 15px 0;
  }
  
  /* 已爆涨标签 - 重点修改部分 */
  .exploded-tag {
    color: #f8e71c;
    padding: 8px 28px;    /* 增大椭圆尺寸 */
    border-radius: 25px;  /* 更圆润的椭圆 */
    font-size: 18px;      /* 增大字体 */
    font-weight: bold;
    margin: 18px auto;    /* 增加外边距 */
    display: inline-block;
    animation: 
      fadeIn 0.5s ease,
      tagPulse 1.5s infinite;
    border: 2px solid #f8e71c;
    background-color: transparent;
    box-shadow: 0 0 15px rgba(248, 231, 28, 0.5);
    min-width: 140px;     /* 确保最小宽度 */
    text-align: center;
    letter-spacing: 2px;  /* 增加文字间距 */
  }
  
  @keyframes tagPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  
  .use-now {
    background: linear-gradient(to right, #f8e71c, #f5a623);
    color: #b32512;
    border: none;
    padding: 12px 35px;
    border-radius: 25px;
    font-size: 18px;
    font-weight: bold;
    margin-top: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  
  .use-now:hover {
    transform: scale(1.05);
  }
  
  .use-now:active {
    transform: scale(0.98);
  }
  
  /* 关闭按钮 - 重点美化 */
  .close-modal {
    position: absolute;
    top: 25px;
    right: 25px;
    width: 42px;
    height: 42px;
    background: #ff4757;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: white;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 2px solid #fff;
    z-index: 1001;
  }
  
  .close-modal:hover {
    transform: scale(1.15) rotate(90deg);
    background: #ff6b81;
  }
  
  .close-modal:active {
    transform: scale(0.95);
  }
  
  /* 响应式设计 */
  @media (max-width: 480px) {
    .packets-container {
      grid-template-columns: 1fr 1fr;
    }
    
    .daily-container {
      grid-template-columns: 1fr 1fr;
    }
    
    .card-container {
      flex-direction: column;
      gap: 15px;
    }
    
    .card-price {
      text-align: left;
    }
  
    /* 移动端弹窗调整 */
    .big-red-packet {
      width: 260px;
      height: 360px;
    }
  
    .exploded-tag {
      padding: 6px 20px;
      font-size: 16px;
    }
  }
  </style>