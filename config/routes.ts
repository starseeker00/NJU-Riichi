const routes = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        title: '首页',
        path: "/home",
        component: "Home",
        nav: true,
    },
    {
        title: '赛事',
        path: "/contests",
        component: "Contests",
        nav: true,
        routes: [
            {
                path: "/contests/:id/players",
                component: "Contests/PlayerStatistics"
            },
            {
                path: "/contests/:id/records",
                component: "Contests/GameRecords"
            }
        ]
    },
    {
        title: '牌谱详情',
        path: "/records/:uuid",
        component: "RecordDetail"
    },
    {
        title: '更新日志',
        path: "/changelog",
        component: "Changelog",
        nav: true,
    },
    {
        path: "*",
        component: "404"
    }
]

export default routes;