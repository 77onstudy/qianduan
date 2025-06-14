<template>
	<div class="footer">
		<li @click="toIndex">
			<i class="fa fa-home"></i>
			<p>首页</p>
		</li>
		<li>
			<i class="fa fa-compass"></i>
			<p>发现</p>
		</li>
		<li @click="toOrderList">
			<i class="fa fa-file-text-o"></i>
			<p>订单</p>
		</li>
		<li @click="toUser">
			<i class="fa fa-user-o"></i>
			<p>我的</p>
		</li>
	</div>
</template>

<script>
	export default {
		name: 'NavFooter',
		methods: {
			toIndex() {
				this.$router.push({
					path: '/index'
				});
			},
			toOrderList() {
				this.$router.push({
					path: '/orderList'
				});
			},
			toUser() {
				this.$router.push({ 
					path: '/user' }) // 👈 跳转到用户页
			}
		}
	}
</script>

<style scoped>
	.footer {
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

	.footer li {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: #999;
		user-select: none;
		cursor: pointer;
	}

	.footer li p {
		font-size: 2.8vw;
	}

	.footer li i {
		font-size: 5vw;
	}
</style>