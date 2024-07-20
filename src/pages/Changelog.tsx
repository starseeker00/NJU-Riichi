
const log = {
    '2024-07-12': [
        'demo页面上线啦 🎉',
    ],
    '2024-07-13': [
        '修复了刷新页面会404的bug',
        '新增了更新日志页面',
    ],
    '2024-07-14': [
        '新增了牌谱记录切换玩家排序方式的功能',
    ],
    '2024-07-20': [
        '更改了网页的标题和图标',
        '新增了赛事列表',
    ]
}

const Changelog = () => {
    return (
        <div>
            <h1>更新日志</h1>
            <ul>
                {Object.entries(log).reverse()
                    .map(([date, changes]) => (
                        <li key={date}>
                            <h2>{date}</h2>
                            <ul>
                                {changes.map((change, index) => (
                                    <li key={index}>{change}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
            </ul>
        </div>
    )
}

export default Changelog;