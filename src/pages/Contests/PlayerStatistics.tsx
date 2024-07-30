import { getContestPlayers } from "@/services/api";
import { Table } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "umi";

interface PlayerData {
    username: string;
    ttl_accuracy: number;
    ttl_match: number;
    avg_rank: number;
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

const columns = [
    {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
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
    },
    {
        title: '总分',
        dataIndex: 'ttl_accuracy',
        key: 'ttl_accuracy',
    },
    {
        title: '对局数',
        dataIndex: 'ttl_match',
        key: 'ttl_match',
    },
    {
        title: '均顺',
        dataIndex: 'avg_rank',
        key: 'avg_rank',
    },
    {
        title: '均打点',
        dataIndex: 'avg_dadian',
        key: 'avg_dadian',
    },
    {
        title: '和率',
        dataIndex: 'pct_hu',
        key: 'pct_hu',
    },
    {
        title: '自摸',
        dataIndex: 'pct_zimo',
        key: 'pct_zimo',
    },
    {
        title: '铳率',
        dataIndex: 'pct_chong',
        key: 'pct_chong',
    },
    {
        title: '立直',
        dataIndex: 'pct_lizhi',
        key: 'pct_lizhi',
    },
    {
        title: '副露',
        dataIndex: 'pct_fulu',
        key: 'pct_fulu',
    },
    {
        title: '追立',
        dataIndex: 'pct_zhuili',
        key: 'pct_zhuili',
    },
    {
        title: '振立',
        dataIndex: 'pct_zhenli',
        key: 'pct_zhenli',
    },
    {
        title: '中裏',
        dataIndex: 'pct_ura',
        key: 'pct_ura',
    },
    {
        title: '默听',
        dataIndex: 'pct_dama',
        key: 'pct_dama',
    },
    {
        title: '偏听',
        dataIndex: 'pct_houfu',
        key: 'pct_houfu',
    },
    {
        title: '振听',
        dataIndex: 'pct_zhenting',
        key: 'pct_zhenting',
    },
]

const PlayerStatistics = () => {
    const params = useParams<{ id: string }>();

    const [players, setPlayers] = useState<PlayerData[]>([]);

    useEffect(() => {
        getContestPlayers(Number(params.id)).then(res => {
            setPlayers(res.data.map((player: any, index: number) => {
                return {
                    ...player,
                    rank: index + 1,
                }
            }));
        })
    }, [params.id])

    return (
        <Table dataSource={players} columns={columns} />
    )
}

export default PlayerStatistics;