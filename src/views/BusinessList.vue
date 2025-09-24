<template>
	<div class="wrapper">
		<header>
			<p>商家列表</p>
		</header>

		<div class="toolbar">
			<input
				class="search"
				v-model.trim="keyword"
				type="text"
				placeholder="搜索商家名称 / 地址..."
				@keyup.enter="applyFilter"
			/>
			<button class="btn" @click="applyFilter">搜索</button>
			<button class="btn btn--ghost" @click="resetFilter">重置</button>
		</div>

		<div class="table-wrap">
			<table class="biz-table">
				<thead>
					<tr>
						<th style="width: 80px;">Logo</th>
						<th @click="toggleSort('businessName')">
							商家名称
							<span class="sort-ico" :class="sortIcon('businessName')"></span>
						</th>
						<th>地址</th>
						<th style="width: 120px;" @click="toggleSort('startPrice')">
							起送价
							<span class="sort-ico" :class="sortIcon('startPrice')"></span>
						</th>
						<th style="width: 120px;" @click="toggleSort('deliveryPrice')">
							配送费
							<span class="sort-ico" :class="sortIcon('deliveryPrice')"></span>
						</th>
						<th style="width: 100px;" @click="toggleSort('deleted')">
							状态
							<span class="sort-ico" :class="sortIcon('deleted')"></span>
						</th>
						<th style="width: 140px;">操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="loading">
						<td colspan="7" class="status">加载中...</td>
					</tr>
					<tr v-else-if="error">
						<td colspan="7" class="status error">{{ error }}</td>
					</tr>
					<tr v-else-if="!displayedBusinesses.length">
						<td colspan="7" class="status">暂无商家</td>
					</tr>

					<tr
						v-for="item in displayedBusinesses"
						:key="item.id"
						class="row"
					>
						<td>
							<div class="logo-box">
								<img
									:src="item.businessImg || placeholder"
									:alt="item.businessName || '商家Logo'"
									@error="onImgError"
								/>
								<span
									v-if="item.quantity > 0"
									class="qty-badge"
									:title="'购物车内商品数：' + item.quantity"
								>{{ item.quantity }}</span>
							</div>
						</td>
						<td>
							<div class="name-cell">
                                <span class="name">{{ item.businessName || '未命名商家' }}</span>
								<span v-if="item.remarks" class="remark" :title="item.remarks">{{ item.remarks }}</span>
							</div>
						</td>
						<td class="ellipsis" :title="item.businessAddress || '（无地址）'">
							{{ item.businessAddress || '（无地址）' }}
						</td>
						<td>¥{{ fmtMoney(item.startPrice) }}</td>
						<td>¥{{ fmtMoney(item.deliveryPrice) }}</td>
						<td>
							<span
								class="tag"
								:class="item.deleted ? 'tag--disabled' : 'tag--ok'"
							>{{ item.deleted ? '禁用' : '正常' }}</span>
						</td>
						<td>
							<button class="btn btn--primary" @click="toBusinessInfo(item.id)">查看详情</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>

	export default {
		name: 'BusinessList',
		data() {
			return {
				loading: true,
				error: '',
				businessArr: [],
				user: {},
				keyword: '',
				sortKey: 'businessName',
				sortOrder: 'asc' // asc | desc
			}
		},
		created() {
			this.user = this.$getSessionStorage && this.$getSessionStorage('user')

			this.$axios
				.get('/api/businesses/All')
				.then((response) => {
					if (response.data && Array.isArray(response.data.data)) {
						this.businessArr = response.data.data.map((x) => ({ ...x, quantity: 0 }))
					} else {
						this.businessArr = []
					}
					if (this.user && this.user.userId) {
						this.listCart()
					}
				})
				.catch((e) => {
					console.error(e)
					this.error = e && e.message ? e.message : '加载失败'
				})
				.finally(() => {
					this.loading = false
				})
		},
		computed: {
			displayedBusinesses() {
				let list = [...this.businessArr]

				// 过滤
				if (this.keyword) {
					const kw = this.keyword.toLowerCase()
					list = list.filter((b) => {
						const name = (b.businessName || '').toLowerCase()
						const addr = (b.businessAddress || '').toLowerCase()
						return name.includes(kw) || addr.includes(kw)
					})
				}

				// 排序
				const key = this.sortKey
				const mul = this.sortOrder === 'asc' ? 1 : -1
				list.sort((a, b) => {
					let av = a[key]
					let bv = b[key]
					// 空值靠后
					if (av === undefined || av === null) return 1
					if (bv === undefined || bv === null) return -1

					// 数字比较
					if (typeof av === 'number' && typeof bv === 'number') {
						return (av - bv) * mul
					}
					// 布尔比较（deleted: false < true）
					if (typeof av === 'boolean' && typeof bv === 'boolean') {
						return ((av === b[key]) ? 0 : (av ? 1 : -1)) * mul
					}
					// 字符串比较
					av = String(av).toLowerCase()
					bv = String(bv).toLowerCase()
					if (av === bv) return 0
					return (av > bv ? 1 : -1) * mul
				})

				return list
			},
			placeholder() {
				return (
					'data:image/svg+xml;utf8,' +
					encodeURIComponent(
						`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90">
							<rect width="100%" height="100%" fill="#f2f3f5"/>
							<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="12">No Image</text>
						</svg>`
					)
				)
			}
		},
		methods: {
			onImgError(e) {
				e.target.src = this.placeholder
			},
			fmtMoney(n) {
				if (n === null || n === undefined || Number.isNaN(Number(n))) return '0.00'
				return Number(n).toFixed(2)
			},
			toBusinessInfo(businessId) {
				this.$router.push({
					path: '/businessInfo',
					query: { businessId }
				})
			},
			applyFilter() {
				// 这里 computed 已经会响应 keyword，无需额外逻辑
			},
			resetFilter() {
				this.keyword = ''
			},
			listCart() {
				this.$axios
					.post(
						'CartController/listCart',
						this.$qs.stringify({ userId: this.user.userId })
					)
					.then((response) => {
						const cartArr = Array.isArray(response.data) ? response.data : []
						for (const biz of this.businessArr) {
							biz.quantity = 0
							for (const cart of cartArr) {
								if (cart.businessId == biz.id) {
									biz.quantity += cart.quantity
								}
							}
						}
					})
					.catch((e) => console.error(e))
			},
			toggleSort(key) {
				if (this.sortKey === key) {
					this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
				} else {
					this.sortKey = key
					this.sortOrder = 'asc'
				}
			},
			sortIcon(key) {
				if (this.sortKey !== key) return ''
				return this.sortOrder === 'asc' ? 'asc' : 'desc'
			}
		}
	}
</script>

<style scoped>
	:root {
		--header-h: 56px;
		--toolbar-h: 48px;
	}

	/* 也可用 clamp 自适应：
	:root { --header-h: clamp(48px, 6vw, 64px); --toolbar-h: 48px; }
	*/

	@media (min-width: 1024px) {
		/* 桌面略高一点更好看 */
		:root {
			--header-h: 64px;
		}
	}

	/* 布局 */
	.wrapper {
		width: 100%;
		height: 100%;
		padding-bottom: 14vw; /* 原样保留底部 Nav 占位 */
	}

	header {
		width: 100%;
		height: var(--header-h); /* ✅ 改掉 12vw */
		background-color: #8097FF;
		color: #fff;
		font-size: 18px;
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* 工具栏（选择栏）设置为紧贴 header 的第二层，固定高度 + 粘性定位 */
	.toolbar {
		position: sticky;
		top: var(--header-h); /* ✅ 紧贴 header 之下 */
		z-index: 90; /* 在表头之上，防遮挡 */
		display: flex;
		gap: 8px;
		align-items: center;
		height: var(--toolbar-h); /* ✅ 固定高度，避免“下沉”错位 */
		padding: 0 12px;
		background: #fff;
		border-bottom: 1px solid #eee;
		box-shadow: 0 1px 0 rgba(0,0,0,0.03);
	}
	.search {
		flex: 1;
		height: 32px;
		padding: 0 10px;
		border: 1px solid #ddd;
		border-radius: 8px;
		outline: none;
	}
	.btn {
		height: 32px;
		padding: 0 12px;
		border: 1px solid #4c6fff;
		border-radius: 8px;
		background: #4c6fff;
		color: #fff;
		cursor: pointer;
	}
	.btn--ghost {
		background: #fff;
		color: #4c6fff;
	}
	.btn--primary {
		background: #4c6fff;
		color: #fff;
		border: 1px solid #4c6fff;
		border-radius: 6px;
		padding: 6px 10px;
		cursor: pointer;
	}

	/* 表格 */
	.table-wrap {
		padding: 12px;
		overflow-x: auto;
	}
	.biz-table {
		width: 100%;
		border-collapse: collapse;
		background: #fff;
		border: 1px solid #eee;
		border-radius: 10px;
		overflow: hidden;
	}
	.biz-table th,
	.biz-table td {
		padding: 10px 12px;
		border-bottom: 1px solid #f2f2f2;
		text-align: left;
		font-size: 14px;
		color: #333;
		vertical-align: middle;
		white-space: nowrap;
	}
	.biz-table thead th {
		background: #f9fafb;
		position: sticky;
		/* ✅ 表头粘在 toolbar 下面，不随屏幕变宽而“沉下去” */
		top: calc(var(--header-h) + var(--toolbar-h));
		z-index: 80;
	}
	.biz-table tbody tr:hover {
		background: #fafcff;
	}

	/* 排序图标 */
	.sort-ico {
		display: inline-block;
		margin-left: 6px;
		border: 5px solid transparent;
		border-top-color: #bbb;
		transform: translateY(2px);
	}
	.sort-ico.desc {
		border-top-color: transparent;
		border-bottom-color: #555;
		transform: rotate(180deg) translateY(-2px);
	}
	.sort-ico.asc {
		border-top-color: #555;
	}

	/* Logo与数量 */
	.logo-box {
		position: relative;
		width: 64px;
		height: 48px;
		border-radius: 6px;
		overflow: hidden;
		background: #f5f5f5;
	}
	.logo-box img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.qty-badge {
		position: absolute;
		right: -6px;
		top: -6px;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 10px;
		background: #ff4d4f;
		color: #fff;
		font-size: 12px;
		line-height: 20px;
		text-align: center;
	}

	/* 名称与备注 */
	.name-cell {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.name {
		font-weight: 600;
		color: #333;
	}
	.remark {
		font-size: 12px;
		color: #999;
		max-width: 360px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 文本辅助 */
	.tag {
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
		border: 1px solid #ddd;
	}
	.tag--ok {
		background: #f3fff7;
		color: #1b9a55;
		border-color: #ccebdc;
	}
	.tag--disabled {
		background: #fafafa;
		color: #9b9b9b;
		border-color: #e9e9e9;
	}
	.status {
		text-align: center;
		padding: 16px;
		color: #666;
	}
	.status.error {
		color: #c0392b;
	}
	.ellipsis {
		max-width: 360px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 底部导航保持 */
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
</style>
