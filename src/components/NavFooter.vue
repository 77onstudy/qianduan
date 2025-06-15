<template>
	<div class="footer">
		<li @click="toIndex">
			<i class="fa fa-home"></i>
			<p>首页</p>
		</li>
		<li @click="toHongbao">
			<i class="fa fa-gift"></i>
			<p>爆红包</p>
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
					path: '/Index'
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
			},
			toHongbao() {
				this.$router.push({ 
					path: '/DiscoverPage' }) // 👈 跳转到用户页
			}
		}
	}
</script>

<style scoped>
	.footer {
		width: 100%;
		height: 14vw;
		border-top: solid 1px #e0e0e0;
		background-color: #fff;
		position: fixed;
		left: 0;
		bottom: 0;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
		z-index: 100;
	}

	.footer li {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: #888;
		user-select: none;
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0 3vw;
		height: 100%;
		}

	.footer li:hover, 
	.footer li:active {
		color: #4285f4; /* 红色改为蓝色 */
		transform: translateY(-2px);
	}

	.footer li p {
		font-size: 2.8vw;
		margin-top: 1vw;
		font-weight: 400;
	}

	.footer li i {
		font-size: 5vw;
		transition: all 0.2s ease;
	}

	.footer li:hover i {
		transform: scale(1.1);
	}

	/* 添加活动状态样式 */
	.footer li.router-link-active {
		color: #4285f4; /* 红色改为蓝色 */
	}

	.footer li.router-link-active i {
		font-weight: bold;
	}
</style>