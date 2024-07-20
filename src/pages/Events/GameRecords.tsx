import { getRecords } from "@/services/api";
import { Radio, RadioChangeEvent, Table } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "umi";

interface Score {
    nickname: string;
    seat: number;
    point: number;
}

const GameRecords = () => {
    const [data, setData] = useState<Score[]>([]);
    const [mode, setMode] = useState<'seat' | 'point'>('seat');

    const params = useParams<{ id: string }>();

    useEffect(() => {
        getRecords(Number(params.id)).then(res => {
            setData(res.data);
        })
    }, [params.id]);

    const columns = [
        {
            title: '完场时间',
            dataIndex: 'time',
            render: (time: number) => new Date(time * 1000).toLocaleString(),
        },
        {
            title: mode === 'seat' ? '东起' : '一位',
            dataIndex: '0',
            width: 300,
            render: ({ nickname, point }: Score) => <span>{nickname} ({point})</span>
        },
        {
            title: mode === 'seat' ? '南起' : '二位',
            dataIndex: '1',
            width: 300,
            render: ({ nickname, point }: Score) => <span>{nickname} ({point})</span>
        },
        {
            title: mode === 'seat' ? '西起' : '三位',
            dataIndex: '2',
            width: 300,
            render: ({ nickname, point }: Score) => <span>{nickname} ({point})</span>
        },
        {
            title: mode === 'seat' ? '北起' : '四位',
            dataIndex: '3',
            width: 300,
            render: ({ nickname, point }: Score) => <span>{nickname} ({point})</span>
        }
    ]

    const transformRecord = (record: any) => {
        const sortedScore = record.score
            .sort((a: Score, b: Score) => mode === 'seat' ? a.seat - b.seat : b.point - a.point)
            .reduce((acc: Record<number, Score>, cur: Score, index: number) => {
                acc[index] = cur;
                return acc;
            }, {} as Record<number, Score>);
        return {
            ...record,
            ...sortedScore
        }
    }

    const handleModeChange = (e: RadioChangeEvent) => {
        setMode(e.target.value);
    }

    return (
        <>
            <div style={{ marginBottom: 8, float: "right" }}>
                排序方式：
                <Radio.Group onChange={handleModeChange} value={mode} >
                    <Radio.Button value="seat">座次</Radio.Button>
                    <Radio.Button value="point">顺次</Radio.Button>
                </Radio.Group>
            </div>

            <Table
                dataSource={data.map(transformRecord)}
                columns={columns} />
        </>
    )
}

export default GameRecords;