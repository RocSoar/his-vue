<script setup lang="ts">

</script>

<template>
  <div class="content">
    <div class="title">
      诶呀, 你访问的页面不存在!
    </div>
  </div>
</template>

<style scoped lang="less">
.content {
  background-image: url("../assets/404.jpg");
  background-size: cover;
  background-position: center;
  text-align: center;
  height: 100%;

  .title {
    font-size: 28px;
    color: #666;
    padding-top: 100px;
  }
}
</style>