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
            }
        ]
    },
    {
        path: '/mis',
        name: 'Main',
        component: () => import('../views/mis/layout.vue'),
        children: []
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