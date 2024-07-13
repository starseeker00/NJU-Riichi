
const log = {
    '2024-07-12': [
        'demo页面上线啦 🎉',
    ],
    '2024-07-13': [
        '更改了路由的配置，修复了刷新页面会404的bug',
        '增加了更新日志页面',
    ],
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