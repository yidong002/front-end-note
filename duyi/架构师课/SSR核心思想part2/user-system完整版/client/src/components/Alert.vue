<template>
  <el-alert :title="alert" :type="type" />
</template>

<script setup>
defineProps({
  type: String,
  alert: String
})
</script>

<style scoped>
/* 这里添加你的样式 */
</style>
