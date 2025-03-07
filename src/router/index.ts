import {createRouter, createWebHistory} from 'vue-router';
import type {RouteRecordRaw} from 'vue-router';

const history = createWebHistory();

const routes: Array<RouteRecordRaw> = [
    {
        path: '/front',
        name: 'Front',
        component: () => import('../views/front/layout.vue'),
        children: [
            {
                path: 'index',
                name: 'FrontIndex',
                component: () => import('../views/front/index.vue'),
            },
            {
                path: 'goods/:id',
                name: 'FrontGoods',
                component: () => import('../views/front/goods.vue')
            },
        ]
    },
    {
        path: '/mis',
        name: 'Main',
        component: () => import('../views/mis/layout.vue'),
        children: [
            {
                path: 'home',
                name: 'MisHome',
                component: () => import('../views/mis/home.vue'),
                meta: {
                    title: '首页',
                }
            },
            {
                path: 'user',
                name: 'MisUser',
                component: () => import('../views/mis/user.vue'),
                meta: {
                    title: '用户管理',
                    isTab: true,
                }
            },
            {
                path: 'dept',
                name: 'MisDept',
                component: () => import('../views/mis/dept.vue'),
                meta: {
                    title: '部门管理',
                    isTab: true,
                }
            },
            {
                path: 'role',
                name: 'MisRole',
                component: () => import('../views/mis/role.vue'),
                meta: {
                    title: '角色管理',
                    isTab: true,
                }
            },
            {
                path: 'goods',
                name: 'MisGoods',
                component: () => import('../views/mis/goods.vue'),
                meta: {
                    title: '体检套餐',
                    isTab: true,
                }
            }
        ]
    },
    {
        path: '/mis/login',
        name: 'MisLogin',
        component: () => import('../views/mis/login.vue')
    },
    {
        path: '/404',
        name: '404',
        component: () => import('../views/404.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
];

const router = createRouter({
    history,
    routes
});

router.beforeEach((to, _from, next) => {
    const permissions = localStorage.getItem('permissions');
    const token = localStorage.getItem('token');
    const toPath = to.fullPath;

    if (toPath === '/mis/login') {
        return next();
    }

    if (toPath.startsWith('/mis')) {
        if (token && permissions) return next();
        else next({name: 'MisLogin'})
    } else if (toPath.startsWith('/front/customer') || toPath.startsWith('/front/goods_snapshot')) {
        if (token) return next();
        else next({name: 'FrontIndex'})
    } else {
        return next()
    }
})

export default router;