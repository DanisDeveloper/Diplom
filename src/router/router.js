import NewShader from "@/pages/NewPage/NewShader.vue";
import {createRouter, createWebHistory} from "vue-router"
import About from "@/pages/About.vue";
import Main from "@/pages/Main.vue";
import Login from "@/pages/Login.vue";
import Profile from "@/pages/Profile.vue";
import Browse from "@/pages/Browse.vue";
import Empty from "@/pages/Empty.vue";

const routes = [
    {
        path: '/',
        component: Main
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/browse',
        component: Browse
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
    history: createWebHistory()
})


export default router;