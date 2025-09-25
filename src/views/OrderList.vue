<template>
  <div class="wrapper">
    <!-- header部分 -->
    <header>
      <p>我的订单</p>
    </header>

    <!-- 订单列表部分 -->
    <h3>未支付订单信息：</h3>
    <div class="order">
      <template v-for="item in orderArr" :key="item.id || item.orderId">
        <div v-if="item.orderState==0">
          <div class="order-info">
            <div>
              {{item.business.businessName}}
              <i class="fa fa-caret-down" @click="detailetShow(item)"></i>
            </div>
            <div class="order-info-right">
              <div>&#165;{{item.orderTotal}}</div>
              <div class="order-info-right-icon" @click="goToPayment(item)">去支付</div>
            </div>
          </div>
          <div class="order-detailet" v-show="item.isShowDetailet">
            <div 
              v-for="(odItem, i) in item.list"
              :key="odItem.id || odItem.food?.id || i"
            >
              <p>{{ odItem.food?.foodName }} x {{ odItem.quantity ?? 0 }}</p>
              <p>&#165;{{ ((odItem.food?.foodPrice ?? 0) * (odItem.quantity ?? 0)).toFixed(2) }}</p>
            </div>
            <div>
              <p>配送费</p>
              <p>&#165;{{item.business.deliveryPrice}}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <h3>已支付订单信息：</h3>
    <div class="order">
      <template v-for="item in orderArr" :key="item.id || item.orderId">
        <div v-if="item.orderState==1">
          <div class="order-info">
            <p>
              {{item.business.businessName}}
              <i class="fa fa-caret-down" @click="detailetShow(item)"></i>
            </p>
            <div class="order-info-right">
              <p>&#165;{{item.orderTotal}}</p>
            </div>
          </div>
          <div class="order-detailet" v-show="item.isShowDetailet">
            <div 
              v-for="(odItem, i) in item.list"
              :key="odItem.id || odItem.food?.id || i"
            >
            <p>{{ odItem.food?.foodName }} x {{ odItem.quantity ?? 0 }}</p>
            <p>&#165;{{ ((odItem.food?.foodPrice ?? 0) * (odItem.quantity ?? 0)).toFixed(2) }}</p>
            </div>
            <div>
              <p>配送费</p>
              <p>&#165;{{item.business.deliveryPrice}}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部菜单部分 -->
    <NavFooter></NavFooter>
  </div>
</template>

<script>
import NavFooter from '../components/NavFooter.vue';

export default {
  name: 'OrderList',
  data() {
    return {
      orderArr: [],
      user: {}
    }
  },
  created() {
    this.user = this.$getSessionStorage('user'); // { userId, userName, ... }
    if (!this.user?.userId) {
      alert('未获取到用户ID，请先登录');
      return;
    }

    const token = sessionStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    this.$axios.get('/api/user', { headers })
      .then(userRes => {
        const id = userRes.data.id

        return this.$axios.get(`/api/orders/userOrder/${id}`, { headers });
      })
      .then(ordersRes => {
        const list = Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : [];
        for (const o of list) {
          o.isShowDetailet = false;
          o.list = Array.isArray(o.orderDetails) ? o.orderDetails : (o.list || []);
          o.orderId = o.id ?? o.orderId;
        }
        this.orderArr = list;
      })
      .catch(err => {
        console.error(err);
        alert(err?.response?.data?.message || err.message || '加载用户/订单失败');
      });

  },
  methods: {
    detailetShow(orders) {
      orders.isShowDetailet = !orders.isShowDetailet;
    },
    goToPayment(order) {
      this.$router.push({
        path: '/payment',
        query: { 
          orderId: order.id,            // 这里从 orderId 改为 id
          from: 'orderList' 
        }
      });
    }
  },
  components: {
    NavFooter
  }
}
</script>

<style scoped>
  /****************** 总容器 ******************/
  .wrapper {
    width: 100%;
    height: 100%;
  }

  /****************** header部分 ******************/
  .wrapper header {
    width: 100%;
    height: 12vw;
    background-color: #0097FF;
    color: #fff;
    font-size: 4.8vw;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /****************** 历史订单列表部分 ******************/
  .wrapper h3 {
    margin-top: 12vw;
    box-sizing: border-box;
    padding: 4vw;
    font-size: 4vw;
    font-weight: 300;
    color: #999;
  }

  .wrapper .order {
    width: 100%;
	display: flex;
	flex-direction: column;
  }

  .wrapper .order div {
    width: 100%;
  }

  .wrapper .order div .order-info {
    box-sizing: border-box;
    padding: 2vw 4vw;
    font-size: 4vw;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
	flex-direction: row;
  }

  .wrapper .order div .order-info .order-info-right {
    display: flex;
	width: 30%;
	justify-content: end;
  }

  .wrapper .order div .order-info .order-info-right .order-info-right-icon {
    background-color: #f90;
    color: #fff;
    border-radius: 5px;
    margin-left: 3vw;
    user-select: none;
    cursor: pointer;
	white-space: nowrap;
  }

  .wrapper .order div .order-detailet {
    width: 100%;
  }

  .wrapper .order div .order-detailet div {
    width: 100%;
    box-sizing: border-box;
    padding: 1vw 4vw;
    color: #666;
    font-size: 3vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  /* ===== Desktop overrides (≥768px) ===== */
@media (min-width: 768px) {
  .wrapper {
    max-width: 1100px;
    margin: 0 auto;
    padding-bottom: 84px; /* 预留底部组件/滚动空间 */
  }

  /* 顶部栏：固定高度与字号 */
  .wrapper header {
    height: 64px;
    font-size: 20px;
    position: sticky;
    top: 0;
    left: 0;
  }

  /* 分段标题：避免过大间距与 vw 字号 */
  .wrapper h3 {
    margin-top: 80px;      /* 避开 header */
    padding: 0 0 12px;
    font-size: 18px;
    font-weight: 500;
    color: #555;
  }

  /* 列表容器：竖向卡片流 */
  .wrapper .order {
    gap: 12px;
  }

  /* 订单卡片：白底、阴影、边框 */
  .wrapper .order div .order-info {
    padding: 14px 18px;
    font-size: 16px;
    color: #333;
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,.06);
  }

  /* 右侧金额 + 操作区 */
  .wrapper .order div .order-info .order-info-right {
    width: auto;           /* 不再固定 30% */
    gap: 12px;
    align-items: center;
  }
  .wrapper .order div .order-info .order-info-right > div:first-child {
    min-width: 88px;
    text-align: right;
    font-weight: 600;
    color: #ff5a36;
  }
  .wrapper .order div .order-info .order-info-right .order-info-right-icon {
    padding: 8px 14px;
    margin-left: 0;
    font-size: 14px;
    background: #ff9f1a;
    border-radius: 10px;
    transition: filter .2s, transform .05s;
    box-shadow: 0 4px 12px rgba(255,159,26,.25);
  }
  .wrapper .order div .order-info .order-info-right .order-info-right-icon:hover {
    filter: brightness(.95);
  }
  .wrapper .order div .order-info .order-info-right .order-info-right-icon:active {
    transform: scale(.98);
  }

  /* 订单明细：卡片化并与 order-info 视觉一致 */
  .wrapper .order div .order-detailet {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,.06);
    overflow: hidden;
  }
  .wrapper .order div .order-detailet div {
    padding: 12px 18px;
    font-size: 15px;
    color: #333;
    border-bottom: 1px solid #f7f7f7;
  }
  .wrapper .order div .order-detailet div:last-child {
    border-bottom: none;
  }

  /* 下拉箭头的点击区稍微放大些更好点按 */
  .fa.fa-caret-down {
    margin-left: 8px;
    cursor: pointer;
    user-select: none;
  }
}

/* ===== Large Desktop (≥1200px) ===== */
@media (min-width: 1200px) {
  .wrapper { max-width: 1180px; }

  .wrapper .order div .order-info { padding: 16px 20px; }
  .wrapper .order div .order-detailet div { padding: 14px 20px; }
}

</style>