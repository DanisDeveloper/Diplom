import NewShader from "@/pages/NewPage/NewShader.vue";
import {createRouter, createWebHistory} from "vue-router"
import About from "@/pages/About.vue";
import Login from "@/pages/Login.vue";
import Profile from "@/pages/ProfilePage/Profile.vue";
import Gallery from "@/pages/Gallery.vue";
import Empty from "@/pages/Empty.vue";
import ShowCase from "@/pages/ShowCase.vue";

const routes = [

    {
        path: '/',
        component: ShowCase
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/gallery',
        component: Gallery
    },
    {
        path: '/new',
        component: NewShader
    },
    {
        path: '/new/:id',
        component: NewShader
    },
    {
        path: '/about',
        component: About
    },
    {
        path: '/profile/:id',
        component: Profile
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'Empty',
        component: Empty
    },

]

const router = createRouter({
    routes,
    history: createWebHistory(),
    scrollBehavior(to, from, savedPosition) {
        // если пользователь использует "назад", вернуть сохранённую позицию
        if (savedPosition) {
            return savedPosition
        } else {
            // иначе перейти в начало страницы
            return { top: 0 }
        }
    },
})


export default router;