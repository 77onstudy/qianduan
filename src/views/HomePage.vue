<template>

	<div class="home">
	<p>正在跳转，请稍候...</p>
	</div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  onMounted(() => {

	router.replace({ name: 'BusinessList' })
  })
  </script>
  
  <style scoped>
  .home {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100vh;
	color: #666;
	font-size: 16px;
  }
  </style>
  