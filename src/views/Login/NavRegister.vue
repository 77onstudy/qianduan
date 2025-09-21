<template>
	<div class="wrapper">
		<!-- header部分 -->
		<header>
			<p>用户注册</p>
		</header>

		<!-- 表单部分 -->
		<div class="form-box">
			<li>
				<div class="title">
					手机号码：
				</div>
				<div class="content">
					<input type="text" @blur="checkUserId" v-model="user.userId" placeholder="手机号码">
				</div>
			</li>
			<li>
				<div class="title">
					密码：
				</div>
				<div class="content">
					<input type="password" v-model="user.password" placeholder="密码">
				</div>
			</li>
			<li>
				<div class="title">
					确认密码：
				</div>
				<div class="content">
					<input type="password" v-model="confirmPassword" placeholder="确认密码">
				</div>
			</li>
			<li>
				<div class="title">
					用户名称：
				</div>
				<div class="content">
					<input type="text" v-model="user.userName" placeholder="用户名称">
				</div>
			</li>
			<li>
				<div class="title">
					性别：
				</div>
				<div class="content" style="font-size: 3vw;">
					<input type="radio" v-model="user.userSex" value="1" style="width:6vw;height:3.2vw;">男
					<input type="radio" v-model="user.userSex" value="0" style="width:6vw;height:3.2vw;">女
				</div>
			</li>
		</div>

		<div class="button-login">
			<button @click="register">注册</button>
		</div>

		<!-- 底部菜单部分 -->
		<NavFooter></NavFooter>
	</div>
</template>

<script>
	import NavFooter from '@/components/NavFooter.vue';

	export default {
		name: 'NavRegister',
		data() {
			return {
				user: {
					userId: '',
					password: '',
					userName: '',
					userSex: 1
				},
				confirmPassword: ''
			}
		},
		methods: {
			// checkUserId() {
			// 	this.$axios.post('UserController/getUserById', this.$qs.stringify({
			// 		userId: this.user.userId,
			// 	})).then(response => {
			// 		if (response.data == 1) {
			// 			this.user.userId = '';
			// 			alert('此手机号码已存在！')
			// 		}
			// 	}).catch(error => {
			// 		console.error(error);
			// 	});
			// },
			async register() {
				if (this.user.userId == '') {
					alert('手机号码不能为空！');
					return;
				}
				if (this.user.password == '') {
					alert('密码不能为空！');
					return;
				}
				if (this.user.password != this.confirmPassword) {
					alert('两次输入的密码不一致！');
					return;
				}
				if (this.user.userName == '') {
					alert('用户名不能为空！');
					return;
				}

				try {
					const body = {
					id: Number(this.user.userId),
					username: this.user.userName,
					deleted: false,
					authorities: [{ name: 'USER' }],
					password: this.user.password
					};

					const resp = await this.$axios.post('/api/users', body, {
					headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
					});

					// —— 统一解析：尽可能从不同形态里取出“有效数据”和“消息” ——
					const status = resp?.status ?? 0;
					const raw = resp?.data;
					const wrappedOk = raw && (raw.success === true || raw.code === 'OK' || raw.code === 0);
					const payload = raw?.data ?? raw; // 兼容 {data:{...}} 或 直接 {...}
					const hasEntityLike =
					payload && (payload.id != null || payload.username != null);

					// 判定成功的多重兜底：
					const ok = (status >= 200 && status < 300) && (wrappedOk || hasEntityLike || raw === '' || raw == null);

					if (ok) {
					// 可选：展示后端返回的用户名/ID
					const uname = payload?.username ?? this.user.userName;
					alert(`注册成功：${uname}`);
					this.$router.go(-1);
					return;
					}

					// 非 OK 的情况，尽力给出后端的错误信息
					const msg =
					raw?.message ||
					raw?.error ||
					(typeof raw === 'string' ? raw : '') ||
					`注册失败（状态码：${status}）`;
					alert(msg);
				} catch (error) {
					console.error(error);
					const msg =
					error?.response?.data?.message ||
					error?.response?.data?.error ||
					error?.message ||
					'注册失败';
					alert(msg);
				}
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

	/****************** 表单部分 ******************/
	.wrapper .form-box {
		width: 100%;
		margin-top: 12vw;
	}

	.wrapper .form-box li {
		box-sizing: border-box;
		padding: 4vw 3vw 0 3vw;
		display: flex;
		align-items: center;
	}

	.wrapper .form-box li .title {
		flex: 0 0 18vw;
		font-size: 3vw;
		font-weight: 700;
		color: #666;
	}

	.wrapper .form-box li .content {
		flex: 1;
	}

	.wrapper .form-box li .content input {
		border: none;
		outline: none;
		width: 100%;
		height: 4vw;
		font-size: 3vw;
	}

	.wrapper .button-login {
		width: 100%;
		box-sizing: border-box;
		padding: 4vw 3vw 0 3vw;
	}

	.wrapper .button-login button {
		width: 100%;
		height: 10vw;
		font-size: 3.8vw;
		font-weight: 700;
		color: #fff;
		background-color: #38CA73;
		border-radius: 4px;
		border: none;
		outline: none;
	}

	.wrapper .button-register {
		width: 100%;
		box-sizing: border-box;
		padding: 4vw 3vw 0 3vw;
	}

	.wrapper .button-register button {
		width: 100%;
		height: 10vw;
		font-size: 3.8vw;
		font-weight: 700;
		color: #666;
		background-color: #EEE;
		border-radius: 4px;
		border: none;
		outline: none;
		border: solid 1px #DDD;
	}
</style>