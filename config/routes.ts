const routes = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        name: '首页',
        path: "/home",
        component: "Home"
    },
    {
        name: '赛事',
        path: "/events",
        component: "Events"
    },
]

export default routes;