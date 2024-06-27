import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('pages/Dashboard1.vue'),
    },
    {
        path: '/test1',
        name: 'Test1',
        component: () => import('pages/Test1Page.vue'),
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
