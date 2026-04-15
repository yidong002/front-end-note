<template>
  <div class="about container">
    <h1 class="page-header">使用说明</h1>
    <p>通过此系统来熟悉 vue 以及 vue router 的使用</p>
    <p>联系方式</p>
    <router-link to="/about/email" class="navigation" exactActiveClass="my-exact-active"
      >邮箱</router-link
    >
    <router-link to="/about/tel" class="navigation" exactActiveClass="my-exact-active"
      >电话</router-link
    >
    <router-view />
  </div>
</template>
