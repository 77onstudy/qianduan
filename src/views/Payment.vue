<template>
	<div class="wrapper">
		<header>
			<p>在线支付</p>
		</header>

		<h3>订单信息：</h3>
		<div class="order-info">
			<p>
				{{orders.business.businessName}}
				<i class="fa fa-caret-down" @click="detailetShow"></i>
			</p>
			<p>&#165;{{orders.orderTotal}}</p>
		</div>

		<div class="order-detailet" v-show="isShowDetailet">
			<li v-for="item in orders.list" :key="item.food.foodId || index">
				<p>{{item.food.foodName}} x {{item.quantity}}</p>
				<p>&#165;{{item.food.foodPrice*item.quantity}}</p>
			</li>
			<li>
				<p>配送费</p>
				<p>&#165;{{orders.business.deliveryPrice}}</p>
			</li>
		</div>

		<div class="payment-section">
			<h3>支付方式:</h3>
			<div class="payment-type">
				<li @click="selectPayment('alipay')">
					<img src="../assets/alipay.png" alt="支付宝">
					<i class="fa fa-check-circle" v-show="paymentType === 'alipay'"></i>
				</li>
				<li @click="selectPayment('wechat')">
					<img src="../assets/wechat.png" alt="微信支付">
					<i class="fa fa-check-circle" v-show="paymentType === 'wechat'"></i>
				</li>
			</div>
		</div>

		<div class="payment-button">
			<button @click="confirmPayment">确认支付</button>
		</div>

	</div>
</template>

<script>

export default {
  name: 'PaymentPage',
  data() {
    return {
      orderId: this.$route.query.orderId,
      orders: { business: {}, list: [] },
      isShowDetailet: false,
      paymentType: 'wechat'
    }
  },
  created() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('请先登录！');
      this.$router.push('/login');
      return;
    }
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 获取订单详情：GET /api/orders/{id}
    this.$axios.get(`/api/orders/${this.orderId}`, config)
      .then(res => {
        const r = res.data || {};
        if (r.success) {
          // 字段兼容：把后端的 orderDetails 映射到前端沿用的 list
          const data = r.data || {};
          data.list = data.orderDetails || [];
          // 兼容 orderId
          data.orderId = data.id;
          this.orders = data;
        } else {
          alert(r.message || '获取订单失败');
        }
      })
      .catch(err => {
        console.error(err);
        alert('网络错误，无法获取订单信息');
      });
  },
  mounted() {
    history.pushState(null, null, document.URL);
    window.onpopstate = () => this.$router.push({ path: '/index' });
  },
  unmounted() {
    window.onpopstate = null;
  },
  methods: {
    detailetShow() {
      this.isShowDetailet = !this.isShowDetailet;
    },
    selectPayment(type) {
      this.paymentType = type;
    },
    confirmPayment() {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('请先登录！');
        this.$router.push('/login');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 支付订单：PATCH /api/orders/pay/{id}
      this.$axios.patch(`/api/orders/pay/${this.orderId}`, null, config)
        .then(res => {
          const r = res.data || {};
          if (r.success) {
            this.$router.push('/orderList');
          } else {
            alert(r.message || '支付失败，请重试！');
          }
        })
        .catch(err => {
          console.error(err);
          alert('支付请求出错，请检查网络');
        });
    }
  },

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

	/****************** 订单信息部分 ******************/
	.wrapper h3 {
		margin-top: 12vw;
		box-sizing: border-box;
		padding: 4vw 4vw 0;
		font-size: 4vw;
		font-weight: 300;
		color: #999;
	}

	.wrapper .order-info {
		box-sizing: border-box;
		padding: 4vw;
		font-size: 4vw;
		color: #666;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.wrapper .order-info p:last-child {
		color: orangered;
	}

	/****************** 订单明细部分 ******************/
	.wrapper .order-detailet {
		width: 100%;
	}

	.wrapper .order-detailet li {
		width: 100%;
		box-sizing: border-box;
		padding: 1vw 4vw;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.wrapper .order-detailet li p {
		font-size: 3vw;
		color: #666;
	}

	/****************** 支付方式部分 ******************/
	.wrapper .payment-section {
		margin-top: 2vw;
		padding: 0 4vw;
	}

	.wrapper .payment-section h3 {
		padding: 2vw 0 1vw;
		margin: 0;
		font-size: 3.8vw;
	}

	.wrapper .payment-type {
		width: 100%;
	}

	.wrapper .payment-type li {
		width: 100%;
		box-sizing: border-box;
		padding: 3vw 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
	}

	.wrapper .payment-type li img {
		width: 33vw;
		height: 8.9vw;
	}

	.wrapper .payment-type li .fa-check-circle {
		font-size: 5vw;
		color: #38CA73;
		margin-left: 3vw;
	}

	/****************** 支付按钮部分 ******************/
	.wrapper .payment-button {
		width: 100%;
		box-sizing: border-box;
		padding: 4vw;
	}

	.wrapper .payment-button button {
		width: 100%;
		height: 10vw;
		border: none;
		outline: none;
		border-radius: 4px;
		background-color: #38CA73;
		color: #fff;
	}

	/****************** 底部菜单部分 ******************/
	.wrapper .NavFooter {
		width: 100%;
		height: 14vw;
		border-top: solid 1px #DDD;
		background-color: #fff;
		position: fixed;
		left: 0;
		bottom: 0;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.wrapper .NavFooter li {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: #999;
		user-select: none;
		cursor: pointer;
	}

	.wrapper .NavFooter li p {
		font-size: 2.8vw;
	}

	.wrapper .NavFooter li i {
		font-size: 5vw;
	}
	/* ===== Desktop overrides (≥768px) ===== */
@media (min-width: 768px) {
  .wrapper {
    max-width: 1100px;
    margin: 0 auto;
    padding-bottom: 88px; /* 给底部组件留空间 */
  }

  /* 头部：固定高度与字号 */
  .wrapper header {
    height: 64px;
    font-size: 20px;
    position: sticky;
    top: 0;
    left: 0;
  }

  /* 标题行：减少上边距、统一字号 */
  .wrapper h3 {
    margin-top: 80px;    /* 避开 header */
    padding: 0 0 12px;
    font-size: 18px;
    color: #666;
  }

  /* 订单信息：卡片化 */
  .wrapper .order-info {
    padding: 16px 20px;
    font-size: 16px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 6px 18px rgba(0,0,0,.06);
  }
  .wrapper .order-info p:last-child { color: #ff5a36; font-weight: 600; }

  /* 订单明细：卡片化 + 更易读的行高 */
  .wrapper .order-detailet {
    margin-top: 12px;
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0,0,0,.06);
    overflow: hidden;
  }
  .wrapper .order-detailet li {
    padding: 14px 18px;
    border-bottom: 1px solid #f7f7f7;
  }
  .wrapper .order-detailet li:last-child { border-bottom: none; }
  .wrapper .order-detailet li p {
    font-size: 15px;
    color: #333;
  }

  /* 支付区：标题与卡片 */
  .wrapper .payment-section {
    margin-top: 16px;
    padding: 0;
  }
  .wrapper .payment-section h3 {
    padding: 12px 0;
    font-size: 18px;
    color: #333;
  }

  /* 支付方式：两列布局（自适应） */
  .wrapper .payment-type {
    display: grid;
    grid-template-columns: repeat(2, minmax(260px, 1fr));
    gap: 12px;
  }
  .wrapper .payment-type li {
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    transition: box-shadow .2s, transform .1s, border-color .2s;
  }
  .wrapper .payment-type li:hover {
    box-shadow: 0 6px 18px rgba(0,0,0,.06);
    border-color: #dcdcdc;
  }
  .wrapper .payment-type li:active { transform: scale(.99); }

  /* 支付图标：固定像素，不用 vw */
  .wrapper .payment-type li img {
    width: 160px;
    height: 44px;
    object-fit: contain;
  }
  .wrapper .payment-type li .fa-check-circle {
    font-size: 20px;
    color: #38CA73;
    margin-left: 8px;
  }

  /* 支付按钮：桌面固定高度与字号 */
  .wrapper .payment-button {
    padding: 18px 0 0;
  }
  .wrapper .payment-button button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    background: #38CA73;
    transition: filter .2s, transform .05s;
  }
  .wrapper .payment-button button:hover { filter: brightness(.96); }
  .wrapper .payment-button button:active { transform: scale(.997); }

  /* 底部导航：桌面可隐藏，或收细 */
  .wrapper .NavFooter {
    display: none; /* 桌面通常不需要底部 Tab，可按需改为块状 */
  }
}

/* ===== Large Desktop (≥1200px) ===== */
@media (min-width: 1200px) {
  .wrapper { max-width: 1180px; }

  .wrapper .order-info { padding: 18px 22px; }
  .wrapper .order-detailet li { padding: 16px 20px; }

  .wrapper .payment-type {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .wrapper .payment-type li img {
    width: 180px;
    height: 48px;
  }
}

</style>