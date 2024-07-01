import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/dashboard_old',
        name: 'Dashboard_old',
        component: () => import('pages/Dashboard1_old.vue'),
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('pages/Dashboard.vue'),
    },
    {
        path: '/test2',
        name: 'Test2',
        component: () => import('pages/Test2Page.vue'),
    },
];

export default function () {
    const createHistory =  createWebHistory;

    const Router = createRouter({
        scrollBehavior: () => ({ left: 0, top: 0 }),
        routes,
        history: createHistory(process.env.VUE_ROUTER_BASE),
    });

    return Router;
}
