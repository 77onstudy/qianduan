<template>
	<div class="wrapper">
		<header class="header">
			<p>商家信息</p>
		</header>
		<div class="business-logo">
			<img class="logo" v-if="business.businessImg" :src="business.businessImg" :alt="business.businessName">
		</div>

		<div class="business-info">
			<h1>{{business.businessName}}</h1>
			<p>&#165;{{business.starPrice}}起送 &#165;{{business.deliveryPrice}}配送</p>
			<p>{{business.businessExplain}}</p>
		</div>

		<div class="food">
			<template v-for="(item,index) in foodArr" :key="item.foodId || index">
				<div class="food1">
				<div class="food-left">
					<img v-if="item.foodImg" :src="item.foodImg" :alt="item.foodName">
					
				</div>
				<div class="food-left-info">
					<div>{{item.foodName}}</div>
					<div>{{item.foodExplain}}</div>
					<div>&#165;{{item.foodPrice}}</div>
					<div class="food-right">
						<div>
							<i class="fa fa-minus-circle" @click="minus(index)" v-show="item.quantity!=0"></i>
						</div>
						<div><span v-show="item.quantity!=0">{{item.quantity}}</span></div>
						<div>
							<i class="fa fa-plus-circle" @click="add(index)"></i>
						</div>
					</div>
				</div>
				
				
				</div>
			</template>
			<!-- 添加无商品提示 -->
			<li v-if="foodArr.length === 0" class="empty-tip">
				<div class="empty-content">
					<i class="fa fa-box-open"></i>
					<p>该商家暂无商品</p>
					<p class="small-tip">请稍后再来看看</p>
				</div>
			</li>
		</div>

		<div class="cart">
			<div class="cart-left">
				<div class="cart-left-icon"
					:style="totalQuantity==0?'background-color:#505051;':'background-color:#3190E8;'">
					<i class="fa fa-shopping-cart"></i>
					<div class="cart-left-icon-quantity" v-show="totalQuantity!=0">{{totalQuantity}}</div>
				</div>
				<div class="cart-left-info">
					<p>&#165;{{totalPrice}}</p>
					<p>另需配送费{{business.deliveryPrice}}元</p>
				</div>
			</div>
			<div class="cart-right">
				<div class="cart-right-item" v-show="totalSettle<business.starPrice"
					style="background-color: #535356;cursor: default;">
					&#165;{{business.starPrice}}起送
				</div>
				<div class="cart-right-item" @click="toOrder" v-show="totalSettle>=business.starPrice">
					去结算
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'BusinessInfo',
		data() {
			return {
				businessId: this.$route.query.businessId,
				business: {},
				foodArr: [],
				user: {}
			}
		},
		created() {
			this.user = this.$getSessionStorage('user');

			this.$axios.post('BusinessController/getBusinessById', this.$qs.stringify({
				businessId: this.businessId
			})).then(response => {
				this.business = response.data;
			}).catch(error => {
				console.error(error);
			});

			this.$axios.post('FoodController/listFoodByBusinessId', this.$qs.stringify({
				businessId: this.businessId
			})).then(response => {
				this.foodArr = response.data;
				for (let i = 0; i < this.foodArr.length; i++) {
					this.foodArr[i].quantity = 0;
				}
				if (this.user != null) {
					this.listCart();
				}
			}).catch(error => {
				console.error(error);
			});
		},
		computed: {
			totalPrice() {
				let total = 0;
				for (let item of this.foodArr) {
					total += Math.floor(item.foodPrice * item.quantity*100);
				}
				total=total/100;
				return total;
			},
			totalQuantity() {
				let quantity = 0;
				for (let item of this.foodArr) {
					quantity += item.quantity;
				}
				return quantity;
			},
			totalSettle() {
				return this.totalPrice + this.business.deliveryPrice;
			}
		},
		methods: {
			listCart() {
				this.$axios.post('CartController/listCart', this.$qs.stringify({
					businessId: this.businessId,
					userId: this.user.userId
				})).then(response => {
					let cartArr = response.data;
					for (let foodItem of this.foodArr) {
						foodItem.quantity = 0;
						for (let cartItem of cartArr) {
							if (cartItem.foodId == foodItem.foodId) {
								foodItem.quantity = cartItem.quantity;
							}
						}
					}
					this.foodArr.sort();
				}).catch(error => {
					console.error(error);
				});
			},
			add(index) {
				if (this.user == null) {
					this.$router.push('/login');
					return;
				}
				if (this.foodArr[index].quantity == 0) {
					this.saveCart(index);
				} else {
					this.updateCart(index, 1);
				}
			},
			minus(index) {
				if (this.user == null) {
					this.$router.push('/login');
					return;
				}
				if (this.foodArr[index].quantity > 1) {
					this.updateCart(index, -1);
				} else {
					this.removeCart(index);
				}
			},
			saveCart(index) {
				this.$axios.post('CartController/saveCart', this.$qs.stringify({
					businessId: this.businessId,
					userId: this.user.userId,
					foodId: this.foodArr[index].foodId
				})).then(response => {
					if (response.data == 1) {
						this.foodArr[index].quantity = 1;
						this.foodArr.sort();
					} else {
						alert('向购物车中添加食品失败！');
					}
				}).catch(error => {
					console.error(error);
				});
			},
			updateCart(index, num) {
				this.$axios.post('CartController/updateCart', this.$qs.stringify({
					businessId: this.businessId,
					userId: this.user.userId,
					foodId: this.foodArr[index].foodId,
					quantity: this.foodArr[index].quantity + num
				})).then(response => {
					if (response.data == 1) {
						this.foodArr[index].quantity += num;
						this.foodArr.sort();
					} else {
						alert('向购物车中更新食品失败！');
					}
				}).catch(error => {
					console.error(error);
				});
			},
			removeCart(index) {
				this.$axios.post('CartController/removeCart', this.$qs.stringify({
					businessId: this.businessId,
					userId: this.user.userId,
					foodId: this.foodArr[index].foodId
				})).then(response => {
					if (response.data == 1) {
						this.foodArr[index].quantity = 0;
						this.foodArr.sort();
					} else {
						alert('从购物车中删除食品失败！');
					}
				}).catch(error => {
					console.error(error);
				});
			},
			toOrder() {
				this.$router.push({
					path: '/orders',
					query: {
						businessId: this.business.businessId
					}
				});
			}
		}
	}
</script>

<style scoped>
	/*********** 总容器 ************/
	.wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	/*********** header部分 ************/
	.header {
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

	/*********** 商家logo部分 ************/
	.business-logo{
		margin-top: 40px;
		width: 100%;
		height: 40vm;
		display: flex;
		justify-content: center;
	}
	.business-logo .img{
		width: 40vm;
		height: 40vm;
	}
	.business-info{
		display: flex;
		justify-content: end;
		flex-direction: column;
		text-align: center;
		display: inline;
	}
	.food{
		display: flex;
		flex-direction: column;		
		
	}
	.food1{
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		margin-bottom: 10px;
		
	}
	.food-left-info{
		display: inline;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		justify-content: space-between;
	}
	.food-right{
		display: flex;
		flex-direction: row;
		justify-content: space-around;	
		
	}
	/****************** 购物车部分 ******************/
	.wrapper .cart {
		width: 100%;
		height: 14vw;
		position: fixed;
		left: 0;
		bottom: 0;
		display: flex;
	}

	.wrapper .cart .cart-left {
		flex: 2;
		background-color: #505051;
		display: flex;
	}

	.wrapper .cart .cart-left .cart-left-icon {
		width: 16vw;
		height: 16vw;
		box-sizing: border-box;
		border: solid 1.6vw #444;
		border-radius: 8vw;
		background-color: #3190E8;
		font-size: 7vw;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: -4vw;
		margin-left: 3vw;
		position: relative;
	}

	.wrapper .cart .cart-left .cart-left-icon-quantity {
		width: 5vw;
		height: 5vw;
		border-radius: 2.5vw;
		background-color: red;
		color: #fff;
		font-size: 3.6vw;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		right: -1.5vw;
		top: -1.5vw;
	}

	.wrapper .cart .cart-left .cart-left-info p:first-child {
		font-size: 4.5vw;
		color: #fff;
		margin-top: 1vw;
	}

	.wrapper .cart .cart-left .cart-left-info p:last-child {
		font-size: 2.8vw;
		color: #AAA;
	}

	.wrapper .cart .cart-right {
		flex: 1;
	}

	/*达到起送费时的样式*/
	.wrapper .cart .cart-right .cart-right-item {
		width: 100%;
		height: 100%;
		background-color: #38CA73;
		color: #fff;
		font-size: 4.5vw;
		font-weight: 700;
		user-select: none;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/*********** 空状态提示 ************/
	.wrapper .food .empty-tip {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 40vw;
		color: #999;
	}

	.wrapper .food .empty-content {
		text-align: center;
	}

	.wrapper .food .empty-content i {
		font-size: 10vw;
		margin-bottom: 3vw;
		color: #ddd;
	}

	.wrapper .food .empty-content p {
		font-size: 4vw;
		margin: 1vw 0;
	}

	.wrapper .food .empty-content .small-tip {
		font-size: 3vw;
		color: #bbb;
	}
</style>