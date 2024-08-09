import MahjongTags from "@/components/MahjongTags";
import { getContestRecords } from "@/services/api";
import { RightSquareOutlined, SearchOutlined } from "@ant-design/icons";
import { Form, Input, Radio, Table } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "umi";
import { AlignType } from "rc-table/lib/interface";
import { SortOrder } from 'antd/es/table/interface';


interface RecordBasic {
    uuid: string;
    end_time: number;
    data: PlayerInfo[];
    tags?: string[];
}

interface PlayerInfo {
    user_id: number;
    username: string;
    seat: number;
    score: number;
    accuracy: number;
    rank: number;
}


const GameRecords = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RecordBasic[]>([]);
    const [search, setSearch] = useState<string>('');
    const [mode, setMode] = useState<'seat' | 'rank'>('rank');

    const params = useParams<{ id: string }>();

    useEffect(() => {
        setLoading(true);
        getContestRecords(Number(params.id)).then(res => {
            const records = res.data.map((record: any) => {
                return {
                    ...record,
                    key: record.uuid,
                    data: JSON.parse(record.data),
                    tags: record.tags?.split(',')
                }
            })
            setData(records);
            setLoading(false);
        })
    }, [params.id]);

    const columns = [
        {
            title: '完场时间',
            dataIndex: 'end_time',
            key: 'end_time',
            align: 'center' as AlignType,
            render: (time: number) => new Date(time * 1000).toLocaleString(),
            sorter: (a: RecordBasic, b: RecordBasic) => a.end_time - b.end_time,
            showSorterTooltip: false,
            defaultSortOrder: 'descend' as SortOrder,
            sortDirections: ['descend', 'ascend', 'descend'] as SortOrder[]
        },
        {
            title: mode === 'seat' ? '东起' : '一位',
            dataIndex: '0',
            key: '0',
            align: 'center' as AlignType,
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: mode === 'seat' ? '南起' : '二位',
            dataIndex: '1',
            key: '1',
            align: 'center' as AlignType,
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: mode === 'seat' ? '西起' : '三位',
            dataIndex: '2',
            key: '2',
            align: 'center' as AlignType,
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: mode === 'seat' ? '北起' : '四位',
            dataIndex: '3',
            key: '3',
            align: 'center' as AlignType,
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: '含以下要素',
            dataIndex: 'tags',
            key: 'tags',
            align: 'center' as AlignType,
            render: (tags: string[]) =>
                Array.from(new Set(tags))
                    .filter(tag => tag)
                    .map((tag) => <MahjongTags key={tag} tag={tag} />
                    )
        },
        {
            dataIndex: 'option',
            key: 'option',
            align: 'center' as AlignType,
            render: (text: any, record: any) => {
                return <Link to={`/records/${record.uuid}`}><RightSquareOutlined /></Link>
            }
        }
    ]

    const transformRecord = (record: RecordBasic) => {
        // console.log("record", record);
        const sortedScore = record.data
            .sort((a: PlayerInfo, b: PlayerInfo) => mode === 'seat' ? a.seat - b.seat : a.rank - b.rank)
            .reduce((acc: Record<string, PlayerInfo>, cur: PlayerInfo, index: number) => {
                acc[index] = cur;
                return acc;
            }, {} as Record<string, PlayerInfo>);
        // console.log("sortedScore", sortedScore);
        return {
            ...record,
            ...sortedScore
        }
    }


    return (
        <>
            <Form layout="inline" style={{ position: 'absolute', top: 8, right: 0 }}>
                <Form.Item>
                    <Input
                        variant="filled"
                        prefix={<SearchOutlined />}
                        placeholder="搜索玩家"
                        allowClear
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="排序方式">
                    <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
                        <Radio.Button value="seat">座次</Radio.Button>
                        <Radio.Button value="rank">顺次</Radio.Button>
                    </Radio.Group>
                </Form.Item>
            </Form>
            <Table
                loading={loading}
                dataSource={data
                    .filter(record => record.data.some(player => player.username.includes(search)))
                    .map(transformRecord)
                }
                columns={columns}
            />
        </>
    )
}

export default GameRecords;