<template>
  <div class="wrapper">
    <!-- header部分 -->
    <header>
      <p>我的订单</p>
    </header>

    <!-- 订单列表部分 -->
    <h3>未支付订单信息：</h3>
    <div class="order">
      <template v-for="item in orderArr" :key="item.orderId">
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
            <div v-for="odItem in item.list" :key="odItem.food.foodId">
              <p>{{odItem.food.foodName}} x {{odItem.quantity}}</p>
              <p>&#165;{{odItem.food.foodPrice*odItem.quantity}}</p>
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
      <template v-for="item in orderArr" :key="item.orderId">
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
            <div v-for="odItem in item.list" :key="odItem.food.foodId">
              <p>{{odItem.food.foodName}} x {{odItem.quantity}}</p>
              <p>&#165;{{odItem.food.foodPrice*odItem.quantity}}</p>
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

    this.$axios.get('/api/orders', { params: { userId: this.user.userId } })
      .then(res => {
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        // 给每条记录加 isShowDetailet，并做轻微字段兜底
        for (const o of list) {
          o.isShowDetailet = false;
          o.orderDetails = o.orderDetails || o.list || []; // 兼容旧字段
        }
        this.orderArr = list;
      })
      .catch(err => {
        console.error(err);
        alert(err?.response?.data?.message || '加载订单失败');
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
</style>