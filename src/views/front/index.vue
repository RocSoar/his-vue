<script setup lang="ts">
import {ref} from "vue";
import SvgIcon from "../../components/SvgIcon.vue";

const msg = ref('Hello World');
const changeMsg = () => msg.value = '你好世界';
</script>

<template>
  <div>index
    <h3>
      {{ msg }}
    </h3>
    <el-button type="primary" size="large" @click="changeMsg">测试</el-button>
    <SvgIcon name="assurance_fill" size="100px"/>
  </div>
</template>

<style scoped>

</style>