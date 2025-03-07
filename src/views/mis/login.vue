<script setup lang="ts">
import {getCurrentInstance, reactive} from "vue";
import {isPassword, isUsername} from "../../utils/validate.ts";
import router from "../../router";

const {proxy} = getCurrentInstance()!;

const loginForm = reactive({
  username: 'admin',
  password: 'abc123456',
})

const qr = reactive({
  qrCodeVisible: false,
  qrCode: '',
  uuid: null,
  qrCodeTimer: null,
  loginTimer: null,
});

function login() {
  if (!isUsername(loginForm.username)) {
    proxy.$message({
      message: '用户名不正确',
      type: 'error',
      duration: 1200,
    })
  } else if (!isPassword(loginForm.password)) {
    proxy.$message({
      message: "密码不正确",
      type: 'error',
      duration: 1200,
    })
  } else {
    proxy.$http("/mis/user/login",
        "POST",
        {username: loginForm.username, password: loginForm.password},
        true,
        response => {
          if (response.result) {
            let permissions = response.permissions;
            let token = response.token;
            localStorage.setItem("permissions", permissions);
            localStorage.setItem("token", token);
            router.push({name: "MisHome"});
          } else {
            proxy.$message({
              message: "登录失败",
              type: "error",
              duration: 1200,
            });
          }
        }
    )
  }
}
</script>

<template>
  <div class="page">
    <div class="panel">
      <div class="left">
        <img src="../../assets/login/logo.png" class="logo" alt=""/>
        <img src="../../assets/login/big.png" class="big" alt=""/>
      </div>
      <div class="right">
        <div class="title-container">
          <h2>神州大健康体检系统</h2>
          <span>V1.0</span>
        </div>
        <div v-if="!qr.qrCodeVisible">
          <div class="row">
            <el-input v-model="loginForm.username" placeholder="用户名"
                      prefix-icon="user" size="large" clearable/>
          </div>
          <div class="row">
            <el-input type="password" v-model="loginForm.password" show-password
                      placeholder="密码" prefix-icon="Lock" size="large" clearable/>
          </div>
          <div class="row">
            <el-button type="primary" class="btn" size="large" @click="login">
              登陆系统
            </el-button>
          </div>
          <div class="row"><a class="link">二维码登陆</a></div>
        </div>
        <div v-if="qr.qrCodeVisible">
          <div class="qrCode-container">
            <img :src="qr.qrCode" height="153" class="qrCode" alt=""/>
            <img src="../../assets/login/phone.png" height="148" alt=""/>
          </div>
          <div class="row"><a class="link">用户名密码登陆</a></div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped lang="less">
@import "login.less";
</style>