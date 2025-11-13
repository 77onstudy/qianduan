<template>
    <div class="frozen-page">
      <!-- 头部 -->
      <header class="header">
        <div class="back-box" @click="$router.go(-1)">
          <span class="back-symbol">&lt;</span>
        </div>
        <h1 class="header-title">冻结资金</h1>
        <div class="header-right"></div>
      </header>
  
      <!-- 内容区 -->
      <div class="content">
        <div class="card">
  
          <!-- 汇总信息 -->
          <div class="summary-box">
            <div class="summary-item">
              <div class="label">未入户资金（元）</div>
              <div class="value">{{ waitMoney.toFixed(2) }}</div>
            </div>
            <div class="divider"></div>
            <div class="summary-item">
              <div class="label">累计冻结金额（元）</div>
              <div class="value">{{ totalMoney.toFixed(2) }}</div>
            </div>
          </div>
  
          <!-- 状态提示 -->
          <div v-if="loading" class="tip-text">正在加载冻结资金信息...</div>
          <div v-else-if="error" class="tip-text error-text">{{ error }}</div>
  
          <!-- 冻结流水列表 -->
          <div v-else>
            <div v-if="freezes.length === 0" class="tip-text">
              暂无冻结资金记录
            </div>
  
            <div v-else class="freeze-list">
              <div
                class="freeze-item"
                v-for="(item, index) in freezes"
                :key="item.id || index"
              >
                <div class="freeze-main">
                  <div class="title">
                    {{ item.order && item.order.business ? item.order.business.businessName : '订单商家' }}
                  </div>
                  <div class="amount">
                    冻结金额：￥{{ Number(item.amount || 0).toFixed(2) }}
                  </div>
                </div>
  
                <div class="freeze-sub">
                  <div class="row">
                    <span class="label">订单金额：</span>
                    <span class="value">
                      ￥{{ item.order && item.order.orderTotal != null ? item.order.orderTotal : '0.00' }}
                    </span>
                  </div>
                  <div class="row">
                    <span class="label">冻结时间：</span>
                    <span class="value">{{ formatTime(item.freezeTime) }}</span>
                  </div>
                  <div class="row" v-if="item.unfreezeTime">
                    <span class="label">解冻时间：</span>
                    <span class="value">{{ formatTime(item.unfreezeTime) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">类型：</span>
                    <span class="value">{{ formatFreezeType(item.freezeType) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">状态：</span>
                    <span class="value">{{ formatStatus(item.status) }}</span>
                  </div>
                  <div class="row" v-if="item.remark">
                    <span class="label">备注：</span>
                    <span class="value">{{ item.remark }}</span>
                  </div>
                </div>
  
              </div>
            </div>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FrozenPage',
    data() {
      return {
        waitMoney: 0,     // 未入户资金
        totalMoney: 0,    // 冻结总金额
        freezes: [],      // 冻结流水列表
        loading: false,
        error: ''
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        this.loading = true;
        this.error = '';
  
        // 同时调两个接口
        Promise.all([this.loadTotal(), this.loadList()])
          .then(() => {
            this.loading = false;
          })
          .catch(err => {
            console.error(err);
            this.loading = false;
            if (!this.error) {
              this.error = '冻结资金信息获取失败';
            }
          });
      },
  
      // GET /api/wallet/totalFreezeMoney
      // res.data.data.waitMoney, totalMoney
      loadTotal() {
        return this.$axios
          .get('/api/wallet/totalFreezeMoney')
          .then(res => {
            const root = res.data || {};
            if (root.success === false) {
              this.error = root.message || '查询未入户资金失败';
              return;
            }
            const data = root.data || {};
            if (typeof data.waitMoney !== 'undefined') {
              this.waitMoney = Number(data.waitMoney) || 0;
            }
            if (typeof data.totalMoney !== 'undefined') {
              this.totalMoney = Number(data.totalMoney) || 0;
            }
          })
          .catch(err => {
            console.error(err);
            if (!this.error) {
              this.error = '查询未入户资金失败';
            }
            throw err;
          });
      },
  
      // GET /api/walllet/listFreeze   （注意：你提供的是 walllet，有三个 l，这里保持一致）
      // res.data.data.walletFreeze
      loadList() {
        return this.$axios
          .get('/api/walllet/listFreeze')
          .then(res => {
            const root = res.data || {};
            if (root.success === false) {
              this.error = root.message || '查询冻结流水失败';
              this.freezes = [];
              return;
            }
            const data = root.data || {};
            const wf = data.walletFreeze;
  
            if (!wf) {
              this.freezes = [];
              return;
            }
  
            // 兼容单个对象 / 数组
            if (Array.isArray(wf)) {
              this.freezes = wf;
            } else {
              this.freezes = [wf];
            }
          })
          .catch(err => {
            console.error(err);
            if (!this.error) {
              this.error = '查询冻结流水失败';
            }
            throw err;
          });
      },
  
      // 格式化时间字符串
      formatTime(t) {
        if (!t) return '-';
        // 兼容 "2019-08-24T14:15:22.123Z" 这种格式
        if (t.length >= 19 && t.includes('T')) {
          return t.substring(0, 19).replace('T', ' ');
        }
        return t;
      },
  
      // 冻结类型文字（可按你后端约定调整）
      // 例如：0=下单冻结，1=售后冻结 等
      formatFreezeType(type) {
        switch (type) {
          case 0:
            return '订单冻结';
          case 1:
            return '售后冻结';
          default:
            return '其他';
        }
      },
  
      // 状态文字（可按你后端约定调整）
      // 例如：0=冻结中，1=已解冻，2=已作废
      formatStatus(status) {
        switch (status) {
          case 0:
            return '冻结中';
          case 1:
            return '已解冻';
          case 2:
            return '已作废';
          default:
            return '未知';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .frozen-page {
    width: 100%;
    min-height: 100vh;
    background-color: #fcfcfa;
    box-sizing: border-box;
    padding-bottom: 90px;
    font-family: 'Segoe UI', 'Inter', sans-serif;
  }
  
  /* 头部 */
  .header {
    width: 100%;
    height: 80px;
    background-color: #ffffff;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    padding: 0 24px;
    box-sizing: border-box;
  }
  
  .back-box {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background-color: #f5f5f2;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .back-box:hover {
    background-color: #ebebe6;
  }
  
  .back-symbol {
    font-size: 22px;
    color: #5d5a56;
    font-weight: 600;
  }
  
  .header-title {
    flex: 1;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #33312e;
    margin: 0;
  }
  
  .header-right {
    width: 44px;
  }
  
  /* 内容区 */
  .content {
    width: 100%;
    max-width: 880px;
    margin: 100px auto 40px;
    padding: 0 24px;
    box-sizing: border-box;
  }
  
  .card {
    width: 100%;
    background-color: #ffffff;
    border-radius: 14px;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
    padding: 24px 20px 26px;
    box-sizing: border-box;
  }
  
  /* 汇总信息 */
  .summary-box {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    border-radius: 16px;
    border: 1px solid #f0efe9;
    background: #fafafa;
    margin-bottom: 18px;
    overflow: hidden;
  }
  
  .summary-item {
    flex: 1;
    padding: 14px 16px;
  }
  
  .summary-item .label {
    font-size: 13px;
    color: #8b877e;
    margin-bottom: 4px;
  }
  
  .summary-item .value {
    font-size: 20px;
    font-weight: 600;
    color: #33312e;
  }
  
  .divider {
    width: 1px;
    background-color: #e6e2da;
  }
  
  /* 提示文字 */
  .tip-text {
    text-align: center;
    color: #66635d;
    font-size: 14px;
    padding: 16px 0 4px;
  }
  
  .error-text {
    color: #c0392b;
  }
  
  /* 冻结记录列表 */
  .freeze-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 6px;
  }
  
  .freeze-item {
    border-radius: 10px;
    border: 1px solid #f0efe9;
    padding: 10px 12px;
    box-sizing: border-box;
    background-color: #fcfcfa;
  }
  
  /* 上半部分：标题 + 金额 */
  .freeze-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  
  .freeze-main .title {
    font-size: 15px;
    font-weight: 600;
    color: #33312e;
  }
  
  .freeze-main .amount {
    font-size: 15px;
    font-weight: 600;
    color: #8faca5;
  }
  
  /* 下半部分：详细信息 */
  .freeze-sub {
    font-size: 12px;
    color: #66635d;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .row {
    display: flex;
    flex-wrap: wrap;
  }
  
  .label {
    color: #a09c97;
    min-width: 70px;
  }
  
  .value {
    color: #55524e;
  }
  
  /* 小屏适配 */
  @media (max-width: 767px) {
    .header {
      height: 70px;
    }
    .content {
      margin: 90px auto 30px;
      padding: 0 16px;
    }
    .card {
      padding: 20px 14px 22px;
    }
    .summary-item .value {
      font-size: 18px;
    }
  }
  </style>
  