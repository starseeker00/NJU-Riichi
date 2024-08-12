import { getContestPlayers } from "@/services/api";
import { Button, Checkbox, Popover, Table, Tooltip } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useParams } from "umi";
import { AlignType } from "rc-table/lib/interface";
import { FilterFilled, QuestionCircleOutlined } from "@ant-design/icons";

interface PlayerData {
    user_id: number;
    username: string;
    rule_accuracy: number;
    ttl_accuracy: number;
    ttl_match: number;
    avg_rank: number;
    opp_avg_rank: number;
    avg_dadian: number;
    pct_hu: number;
    pct_zimo: number;
    pct_chong: number;
    pct_lizhi: number;
    pct_fulu: number;
    pct_zhuili: number;
    pct_zhenli: number;
    pct_ura: number;
    pct_dama: number;
    pct_houfu: number;
    pct_zhenting: number;
}

const infoTooltip = ({ title }: { title: string }) => (
    <Tooltip title={title}>
        <QuestionCircleOutlined style={{ marginLeft: 4, color: 'grey' }} />
    </Tooltip>
)

const ruleMap: { [key: number]: string } = {
    0: '未设置排名方式',
    1: '最近3战合计精算分',
    2: '最近5战合计精算分',
    12: '最佳连续2战合计精算分',
    13: '最佳连续3战合计精算分',
    14: '最佳连续4战合计精算分',
    15: '最佳连续5战合计精算分',
}

const columns = [
    {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
        align: 'center' as AlignType,
        render: (text: number) => {
            switch (text) {
                case 1: return <span>🥇</span>;
                case 2: return <span>🥈</span>;
                case 3: return <span>🥉</span>;
                default: return <span>{text}</span>;
            }
        }
    },
    {
        title: '玩家昵称',
        dataIndex: 'username',
        key: 'username',
        align: 'center' as AlignType,
    },
    {
        title: '计入分',
        dataIndex: 'rule_accuracy',
        key: 'rule_accuracy',
        align: 'center' as AlignType,
        render: (text: number) => <span>{(text && text !== -Infinity) ? (text / 1000) : '-'}</span>
    },
    {
        title: '对局数',
        dataIndex: 'ttl_match',
        key: 'ttl_match',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.ttl_match - b.ttl_match,
        showSorterTooltip: false,
    },
    {
        title: '总分',
        dataIndex: 'ttl_accuracy',
        key: 'ttl_accuracy',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.ttl_accuracy - b.ttl_accuracy,
        showSorterTooltip: false,
    },
    {
        title: '均顺',
        dataIndex: 'avg_rank',
        key: 'avg_rank',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.avg_rank - b.avg_rank,
        showSorterTooltip: false,
    },
    {
        title: '对手均顺',
        dataIndex: 'opp_avg_rank',
        key: 'opp_avg_rank',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.opp_avg_rank - b.opp_avg_rank,
        showSorterTooltip: false,
    },
    {
        title: '均打点',
        dataIndex: 'avg_dadian',
        key: 'avg_dadian',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.avg_dadian - b.avg_dadian,
        showSorterTooltip: false,
    },
    {
        title: '和率',
        dataIndex: 'pct_hu',
        key: 'pct_hu',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_hu - b.pct_hu,
        showSorterTooltip: false,
    },
    {
        title: '自摸',
        dataIndex: 'pct_zimo',
        key: 'pct_zimo',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_zimo - b.pct_zimo,
        showSorterTooltip: false,
    },
    {
        title: '铳率',
        dataIndex: 'pct_chong',
        key: 'pct_chong',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_chong - b.pct_chong,
        showSorterTooltip: false,
    },
    {
        title: '立直',
        dataIndex: 'pct_lizhi',
        key: 'pct_lizhi',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_lizhi - b.pct_lizhi,
        showSorterTooltip: false,
    },
    {
        title: '副露',
        dataIndex: 'pct_fulu',
        key: 'pct_fulu',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_fulu - b.pct_fulu,
        showSorterTooltip: false,
    },
    {
        title: '追立',
        dataIndex: 'pct_zhuili',
        key: 'pct_zhuili',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_zhuili - b.pct_zhuili,
        showSorterTooltip: false,
    },
    {
        title: '振立',
        dataIndex: 'pct_zhenli',
        key: 'pct_zhenli',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_zhenli - b.pct_zhenli,
        showSorterTooltip: false,
    },
    {
        title: '中裏',
        dataIndex: 'pct_ura',
        key: 'pct_ura',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_ura - b.pct_ura,
        showSorterTooltip: false,
    },
    {
        title: '默听',
        dataIndex: 'pct_dama',
        key: 'pct_dama',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_dama - b.pct_dama,
        showSorterTooltip: false,
    },
    {
        title: '偏听',
        dataIndex: 'pct_houfu',
        key: 'pct_houfu',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_houfu - b.pct_houfu,
        showSorterTooltip: false,
    },
    {
        title: '振听',
        dataIndex: 'pct_zhenting',
        key: 'pct_zhenting',
        align: 'center' as AlignType,
        sorter: (a: PlayerData, b: PlayerData) => a.pct_zhenting - b.pct_zhenting,
        showSorterTooltip: false,
    },
]

const options = columns.slice(4).map(({ key, title }) => ({ label: title, value: key }));
const defaultColumns = columns
    .filter(({ key }) => !['pct_zhenli', 'pct_zhuili', 'pct_houfu', 'pct_zhenting'].includes(key))
    .map(({ key }) => key);



const PlayerStatistics = () => {
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState<PlayerData[]>([]);

    const params = useParams<{ id: string }>();
    const { rule } = useOutletContext<{ rule: number }>();

    useEffect(() => {
        setLoading(true);
        getContestPlayers(Number(params.id)).then(res => {
            setPlayers(res.data
                .map((player: any) => {
                    return {
                        ...player,
                        key: player.user_id,
                        rule_accuracy: calc_rule_accuracy(player.accuracy_list.split(',').map(Number), rule),
                    }
                })
                .sort((a: PlayerData, b: PlayerData) => b.rule_accuracy - a.rule_accuracy)
                .map((player: PlayerData, index: number) => ({
                    ...player,
                    rank: index + 1
                }))
            );
            setLoading(false);
        })
    }, [params.id, rule]);

    const calc_rule_accuracy = (accuracyList: number[], rule: number) => {
        if (rule >= 12) {
            const len = rule - 10;
            let max = -Infinity;
            for (let i = 0; i <= accuracyList.length - len; i++) {
                max = Math.max(max, accuracyList.slice(i, i + len).reduce((a, b) => a + b, 0));
            }
            return max;
        } else if (rule === 1) {
            return accuracyList.length >= 3 ? accuracyList.slice(0, 3).reduce((a, b) => a + b, 0) : -Infinity;
        } else if (rule === 2) {
            return accuracyList.length >= 5 ? accuracyList.slice(0, 5).reduce((a, b) => a + b, 0) : -Infinity;
        } else {
            return -Infinity;
        }
    }

    const [open, setOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultColumns);

    return (
        <>
            <Popover
                content={
                    <Checkbox.Group
                        value={selectedColumns}
                        options={options}
                        onChange={(values) => setSelectedColumns(values as string[])}
                        style={{ width: 200 }}
                    />
                }
                trigger="click"
                open={open}
                onOpenChange={(newOpen) => setOpen(newOpen)}
            >
                <Button
                    icon={<FilterFilled />}
                    size="small"
                    style={{ position: 'absolute', top: 16, right: 0 }}
                ></Button>
            </Popover>
            <Table
                loading={loading}
                dataSource={players}
                columns={
                    columns.map(column => {
                        if (['rule_accuracy'].includes(column.key)) {
                            {
                                return {
                                    ...column,
                                    title: (
                                        <span>
                                            {column.title}
                                            {infoTooltip({ title: ruleMap[rule] })}
                                        </span>
                                    ),
                                    hidden: !rule,
                                }
                            }
                        }
                        else return {
                            ...column,
                            hidden: options.map(option => option.value).includes(column.key)
                                && !selectedColumns.includes(column.key)
                        }
                    })
                }
            />
        </>
    )
}

export default PlayerStatistics;