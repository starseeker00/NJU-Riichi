const routes = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        title: '首页',
        path: "/home",
        component: "Home"
    },
    {
        title: '赛事',
        path: "/events",
        component: "Events",
        routes: [
            {
                path: "/events/:id/players",
                component: "Events/PlayerStatistics"
            },
            {
                path: "/events/:id/records",
                component: "Events/GameRecords"
            }
        ]
    },
    {
        title: '更新日志',
        path: "/changelog",
        component: "Changelog"
    },
    {
        path: "*",
        component: "404"
    }
]

export default routes;