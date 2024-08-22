import MahjongTags, { preset } from "@/components/MahjongTags";
import { getContestRecords } from "@/services/api";
import { RightSquareOutlined, SearchOutlined, StarFilled, StarOutlined, StarTwoTone } from "@ant-design/icons";
import { Button, Form, Input, Radio, Space, Table } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "umi";
import { AlignType } from "rc-table/lib/interface";
import { SortOrder } from 'antd/es/table/interface';


interface RecordBasic {
    uuid: string;
    schedule: number;
    remark: string;
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

const scheduleMap: { [key: number]: string } = {
    0: '自由匹配',
    1: '海选赛',
    2: '淘汰赛'
}

const GameRecords = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RecordBasic[]>([]);
    const [mode, setMode] = useState<'seat' | 'rank'>('rank');

    const params = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams({ page: '1', pageSize: '10', search: '' });
    const navigate = useNavigate();

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

    const [star, setStar] = useState<string[]>([]);
    const [showStar, setShowStar] = useState<boolean>(false);

    useEffect(() => {
        const star = localStorage.getItem('star');
        if (star) {
            setStar(JSON.parse(star));
        }
    }, []);

    const columns = [
        {
            title: '赛程',
            dataIndex: 'schedule',
            key: 'schedule',
            align: 'center' as AlignType,
            render: (schedule: number, record: RecordBasic) => {
                return record.remark || scheduleMap[schedule] || '未知';
            },
            filters: [
                { text: '海选赛', value: 1 },
                { text: '淘汰赛', value: 2 },
            ],
            onFilter: (value: number, record: RecordBasic) => record.schedule === value,
        },
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
                    ),
            filters: [
                { text: '役满', value: preset.legend },
                { text: '【超稀有】', value: preset.epic },
                { text: '【稀有】', value: preset.rare },
                { text: '立一摸', value: '立一摸' },
                { text: '里三', value: '里三' },
                { text: '岭上开花', value: '岭上开花' },
                { text: '海底捞月', value: '海底捞月' },
                { text: '大吊车', value: '大吊车' },
                { text: '一炮多响', value: '一炮多响' },
                { text: '烧鸡', value: '烧鸡' },
            ],
            onFilter: (value: string | string[], record: RecordBasic) =>
                Array.isArray(value)
                    ? value.some(v => record.tags?.some(tag => tag.startsWith(v)))
                    : record.tags?.includes(value),
        },
        {
            dataIndex: 'option',
            key: 'option',
            align: 'center' as AlignType,
            render: (text: any, record: any) => {
                return (
                    <Space>
                        <Button type="text" icon={star.includes(record.uuid) ? <StarFilled /> : <StarOutlined />}
                            onClick={() => {
                                localStorage.setItem('star', JSON.stringify(star.includes(record.uuid) ? star.filter(item => item !== record.uuid) : [...star, record.uuid]));
                                setStar(star.includes(record.uuid) ? star.filter(item => item !== record.uuid) : [...star, record.uuid])
                            }} />
                        <Button type="text" icon={<RightSquareOutlined />} onClick={() => navigate(`/records/${record.uuid}`)} />
                    </Space>
                )
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
                    <Button icon={<StarFilled />}
                        type={showStar ? 'primary' : 'default'}
                        onClick={() => { setShowStar(!showStar); }}
                    >收藏</Button>
                </Form.Item>
                <Form.Item>
                    <Input
                        variant="filled"
                        prefix={<SearchOutlined />}
                        placeholder="搜索玩家"
                        allowClear
                        value={searchParams.get('search') || ''}
                        onChange={(e) => setSearchParams({ search: e.target.value })}
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
                    .filter(record => !showStar || star.includes(record.uuid))
                    .filter(record => record.data.some(player => player.username.includes(searchParams.get('search') || '')))
                    .map(transformRecord)
                }
                columns={columns}
                pagination={{
                    current: Number(searchParams.get('page')),
                    pageSize: Number(searchParams.get('pageSize')),
                    onChange: (page, pageSize) => {
                        setSearchParams({
                            search: searchParams.get('search') || '',
                            page: page.toString(),
                            pageSize: pageSize.toString()
                        });
                    }
                }}
            />
        </>
    )
}

export default GameRecords;