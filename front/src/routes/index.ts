import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import { DashboardPages, ForgotPasswordPages, GroupsPages, HomePages, LoginPages, OtpCodePages, PaymentsPages, RegisterPages, ResetPasswordPages, StudentsPages } from "../views"
import Cookies from "js-cookie"



const routes:RouteRecordRaw[] = [
    {path:"/",component:LoginPages},
    {path:"/register",component:RegisterPages},
    {path:"/forgot-password",component:ForgotPasswordPages},
    {path:"/otp-code",component:OtpCodePages},
    {path:"/reset-password",component:ResetPasswordPages},
    {
        path:"/dashboard",component:DashboardPages,meta:{auth:true},
        children:[
            {path:"",component:HomePages},
            {path:"groups",component:GroupsPages},
            {path:"students",component:StudentsPages},
            {path:"payments",component:PaymentsPages},
        ]
}
]


const router = createRouter({
    history:createWebHistory(),
    routes
})

router.beforeEach((to)=>{
    const token = Cookies.get("token")
    if(to.meta.auth && !token){
        return('/')
    }
    else if(token  && (to.path === '/' || to.path === '/register')){
        return ('/dashboard')
    }

})


export  default router