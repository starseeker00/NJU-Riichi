import MahjongTags from "@/components/MahjongTags";
import { getContestRecords } from "@/services/api";
import { RightSquareOutlined } from "@ant-design/icons";
import { Radio, RadioChangeEvent, Spin, Table } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "umi";


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
    const [data, setData] = useState<RecordBasic[]>([]);
    const [mode, setMode] = useState<'seat' | 'rank'>('rank');

    const params = useParams<{ id: string }>();
    // const [pageIndex, setPageIndex] = useState(1);
    // const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        getContestRecords(Number(params.id)).then(res => {
            const records = res.data.map((record: any) => {
                return {
                    ...record,
                    data: JSON.parse(record.data),
                    tags: record.tags?.split(',')
                }
            })
            setData(records);
        })
    }, [params.id]);

    const columns = [
        {
            title: '完场时间',
            dataIndex: 'end_time',
            render: (time: number) => new Date(time * 1000).toLocaleString(),
            sortable: true,
        },
        {
            title: mode === 'seat' ? '东起' : '一位',
            dataIndex: '0',
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: mode === 'seat' ? '南起' : '二位',
            dataIndex: '1',
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: mode === 'seat' ? '西起' : '三位',
            dataIndex: '2',
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: mode === 'seat' ? '北起' : '四位',
            dataIndex: '3',
            // width: 300,
            render: ({ username, score }: PlayerInfo) => <span>{username} ({score})</span>
        },
        {
            title: '标签',
            dataIndex: 'tags',
            render: (tags: string[]) =>
                Array.from(new Set(tags))
                    .filter(tag => tag)
                    .map((tag) => <MahjongTags tag={tag} />
                    )
        },
        {
            dataIndex: 'option',
            render: (text: any, record: any) => {
                return <Link to={`/records/${record.uuid}`}><RightSquareOutlined /></Link>
            }
        }
    ]

    const transformRecord = (record: RecordBasic) => {
        console.log("record", record);
        const sortedScore = record.data
            .sort((a: PlayerInfo, b: PlayerInfo) => mode === 'seat' ? a.seat - b.seat : a.rank - b.rank)
            .reduce((acc: Record<string, PlayerInfo>, cur: PlayerInfo, index: number) => {
                acc[index] = cur;
                return acc;
            }, {} as Record<string, PlayerInfo>);
        console.log("sortedScore", sortedScore);
        return {
            ...record,
            ...sortedScore
        }
    }

    const handleModeChange = (e: RadioChangeEvent) => {
        setMode(e.target.value);
    }

    return (
        <Spin spinning={!data.length}>
            <div style={{ marginBottom: 8, float: "right" }}>
                排序方式：
                <Radio.Group onChange={handleModeChange} value={mode} >
                    <Radio.Button value="seat">座次</Radio.Button>
                    <Radio.Button value="rank">顺次</Radio.Button>
                </Radio.Group>
            </div>

            <Table
                dataSource={data.map(transformRecord)}
                columns={columns}
            // pagination={{
            //     current: pageIndex,
            //     pageSize: pageSize,
            //     total: data.length, // wrong total, need backend support
            //     onChange: (page, pageSize) => {
            //         setPageIndex(page);
            //         setPageSize(pageSize);
            //     }
            // }}
            />
        </Spin>
    )
}

export default GameRecords;