import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import zhCn from "element-plus/es/locale/lang/zh-cn";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'virtual:svg-icons-register'
import $ from 'jquery'
import {ElMessage} from "element-plus";
import './styles/global.css'

const app = createApp(App)

app.use(router)
app.use(ElementPlus, {locale: zhCn})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

const baseUrl = 'http://localhost:7700/his-api'
const minioUrl = 'http://localhost:9000/his'

app.config.globalProperties.$baseUrl = baseUrl
app.config.globalProperties.$minioUrl = minioUrl

// 封装全局Ajax公共函数
app.config.globalProperties.$http = function (url: string, method: string, data: JSON, async: boolean, callback: Function) {
    $.ajax({
        url: baseUrl + url,
        type: method,
        dataType: 'json',
        contentType: 'application/json',
//     上传的数据被序列化(允许Ajax上传数组)
        traditional: true,
        xhrFields: {
            // 允许Ajax请求跨域
            withCredentials: true,
        },
        headers: {
            token: localStorage.getItem('token'),
        },
        async: async,
        data: JSON.stringify(data),
        success: function (response) {
            // 后端手动封装的code码
            if (response.code === 200) {
                callback(response)
            } else {
                ElMessage.error({
                    // 后端手动封装的msg
                    message: response.msg,
                    duration: 1200
                })
            }
        },
        error: function (response) {
            if (response.status === undefined) {
                // 当请求没发出去
                ElMessage.error({
                    message: '前端页面错误',
                    duration: 1200
                })
            } else if (!response.hasOwnProperty('responseText')) {
                //当后端没有运行, 或者没有连接上后端项目
                ElMessage.error({
                    message: '连接后端服务器失败, 或者后端项目没有启动',
                    duration: 1200
                })
            } else if (response.status === 401) {
                // 当未登录
                url.startsWith('/front/') ?
                    router.push({name: 'FrontIndex'}) : router.push({name: 'MisLogin'})
            } else {
                ElMessage.error({
                    message: response.responseText,
                    duration: 1200
                })
            }
        }
    })
}

//封装用于判断用户是否具有某些权限的公共函数
app.config.globalProperties.isAuth = function (permissions: string[]): boolean {
    const userPermission: string | null = localStorage.getItem('permissions');

    if (!userPermission) return false

    for (let one of permissions) {
        if (userPermission.includes(one))
            return true
    }
    return false
}

app.mount('#app')
