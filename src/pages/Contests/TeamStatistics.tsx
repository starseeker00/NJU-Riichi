
import { perset_color } from "@/const";
import { getContestTeams } from "@/services/api";
import { Table } from "antd";
import { AlignType } from "rc-table/lib/interface";
import { useEffect, useState } from "react";
import { useParams } from "umi";

interface TeamData {
    team_id: number;
    team_name: string;
    ttl_accuracy: number;
    ttl_one: number;
    ttl_two: number;
    ttl_three: number;
    ttl_four: number;
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
        title: '队伍',
        dataIndex: 'team_name',
        key: 'team_name',
        align: 'center' as AlignType,
        render: (text: string, record: TeamData) => (<div style={{ background: perset_color[record.team_id - 1] }}>{text}</div>),
    },
    {
        title: '总分',
        dataIndex: 'ttl_accuracy',
        key: 'ttl_accuracy',
        align: 'center' as AlignType,
        render: (text: number) => (text / 1000),
    },
    {
        title: '上位差',
        dataIndex: 'ttl_accuracy_diff',
        key: 'ttl_accuracy_diff',
        align: 'center' as AlignType,
        render: (text: number) => (text / 1000),
    },
    {
        title: '淘汰差',
        dataIndex: 'ttl_accuracy_elim',
        key: 'ttl_accuracy_elim',
        align: 'center' as AlignType,
        render: (text: number) => (text / 1000),
    },
    {
        title: '試合数',
        dataIndex: 'ttl_match',
        key: 'ttl_match',
        align: 'center' as AlignType,
    },
    {
        title: '1位',
        dataIndex: 'ttl_one',
        key: 'ttl_one',
        align: 'center' as AlignType,
    },
    {
        title: '2位',
        dataIndex: 'ttl_two',
        key: 'ttl_two',
        align: 'center' as AlignType,
    },
    {
        title: '3位',
        dataIndex: 'ttl_three',
        key: 'ttl_three',
        align: 'center' as AlignType,
    },
    {
        title: '4位',
        dataIndex: 'ttl_four',
        key: 'ttl_four',
        align: 'center' as AlignType,
    },
]


const TeamStatistics = () => {

    const [teams, setTeams] = useState<TeamData[]>([]);
    const [loading, setLoading] = useState(true);

    const params = useParams<{ id: string }>();

    useEffect(() => {
        setLoading(true);
        getContestTeams(Number(params.id)).then((res) => {
            setTeams(res.data.map((team: any, index: number) => ({
                ...team,
                rank: index + 1,
                ttl_accuracy_diff: index === 0 ? 0
                    : ((res.data[index - 1].ttl_accuracy || 0) - (team.ttl_accuracy || 0)),
                ttl_accuracy_elim: index < Math.floor(res.data.length / 2)
                    ? (team.ttl_accuracy || 0) - (res.data[Math.floor(res.data.length / 2)]?.ttl_accuracy || 0)
                    : (team.ttl_accuracy || 0) - (res.data[Math.floor(res.data.length / 2) - 1]?.ttl_accuracy || 0),
            })));
            setLoading(false);
        });
    }, [params.id]);

    return (
        <>
            <Table columns={columns} dataSource={teams} loading={loading} rowKey="team_id"
                pagination={
                    {
                        defaultPageSize: 20,
                    }
                } />
        </>
    )
}

export default TeamStatistics;