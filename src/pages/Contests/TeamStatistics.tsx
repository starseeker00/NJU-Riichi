
import { perset_color } from "@/const";
import { getContestTeams } from "@/services/api";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Collapse, Space, Table, Tooltip } from "antd";
import html2canvas from "html2canvas";
import { AlignType } from "rc-table/lib/interface";
import { useEffect, useRef, useState } from "react";
import { useParams } from "umi";

interface TeamData {
    team_id: number;
    team_name: string;
    inherit: number;
    ttl_accuracy: number;
    ttl_accuracy_diff: number;
    ttl_accuracy_elim: number;
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
        title: '继承分',
        dataIndex: 'inherit',
        key: 'inherit',
        align: 'center' as AlignType,
        render: (text: number) => (text / 1000),
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
        title: '试合数',
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


const TeamStatisticsTable = ({ data, hide }: { data: TeamData[], hide?: string[] }) => {
    const tableRef = useRef<HTMLDivElement>(null);

    function downloadImg() {
        console.log(tableRef.current);
        html2canvas(tableRef.current as HTMLElement).then((canvas) => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'table.png';
            a.click();
        });
    }

    return (
        <>
            <Space style={{ position: 'absolute', top: 16, right: 0 }}>
                <Tooltip title="导出图片 (png)">
                    <Button icon={<DownloadOutlined />} size="small" onClick={downloadImg} />
                </Tooltip>
            </Space>
            <div ref={tableRef}>
                <Table
                    columns={
                        columns.map((item) => {
                            if (hide?.includes(item.key)) {
                                return { ...item, hidden: true };
                            }
                            return item;
                        })
                    } dataSource={data} rowKey="team_id"
                    pagination={
                        {
                            defaultPageSize: 20,
                            hideOnSinglePage: true,
                        }
                    } />
            </div>
        </>
    )
}

const TeamStatistics = () => {
    const [teams, setTeams] = useState<{ [key: number]: TeamData[] }>({});
    const [length, setLength] = useState<number>(0);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    const params = useParams<{ id: string }>();

    useEffect(() => {
        setLoading(true);
        getContestTeams(Number(params.id)).then((res) => {
            setTeams(res.data);
            for (let i = 1; i <= 3; i++) {
                if (!res.data[i].length) {
                    setCurrent(Math.max(1, i - 1));
                    setLength(i - 1);
                    break;
                }
            }
            setLoading(false);
        });
    }, [params.id]);

    const items = [
        {
            key: '1',
            label: '常规赛',
            children: <TeamStatisticsTable data={teams[1] || []} hide={['inherit']} />,
        },
        {
            key: '2',
            label: '季后赛',
            children: <TeamStatisticsTable data={teams[2] || []} />,
        },
        {
            key: '3',
            label: '决赛',
            children: <TeamStatisticsTable data={teams[3] || []} hide={['ttl_accuracy_elim']} />,
        },
    ];

    return (
        <Collapse accordion items={items.slice(0, length)}
            activeKey={current.toString()}
            onChange={(key) => setCurrent(Number(key))}
        />
    )
}

export default TeamStatistics;