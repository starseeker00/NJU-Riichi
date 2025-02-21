import MahjongTags from '@/components/MahjongTags';
import { getRecordDetail } from '@/services/api';
import { LinkOutlined } from '@ant-design/icons';
import { Col, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "umi";

interface RecordDetailData {
    user_id: number;
    username: string;
    lizhi: number;
    hule: number;
    chong: number;
    ju_list: string[];
    score_list: number[];
}

const columns = [
    {
        title: '座位',
        dataIndex: 'seat',
        key: 'seat',
        render: (seat: number) => ['东', '南', '西', '北'][seat]
    },
    {
        title: '玩家昵称',
        dataIndex: 'username',
        key: 'username',
    },
    {
        title: '立直',
        dataIndex: 'lizhi',
        key: 'lizhi',
    },
    {
        title: '和了',
        dataIndex: 'hule',
        key: 'hule',
    },
    {
        title: '放铳',
        dataIndex: 'chong',
        key: 'chong',
    },
    {
        title: '成就',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags: string) => tags?.split(',').map((tag) => <MahjongTags key={tag} tag={tag} />)
    }
];

const RecordDetail = () => {
    const navigate = useNavigate()
    const params = useParams<{ uuid: string }>();

    const paipu = `https://game.maj-soul.com/1/?paipu=${params.uuid}`;

    const [data, setData] = useState<RecordDetailData[]>();

    useEffect(() => {
        getRecordDetail(String(params.uuid)).then(res => {
            const detailData = res.data.map((item: any) => ({
                ...item,
                key: item.user_id,
                ju_list: item.ju_list.split(','),
                score_list: item.score_list.split(',').map((score: string) => Number(score))
            }))
            setData(detailData);
        });
    }, [params.uuid]);

    const chartRef = useRef(null);
    const [chartInstance, setChartInstance] = useState<echarts.ECharts>();

    useEffect(() => {
        if (!chartRef.current) return;

        const chart = echarts.init(chartRef.current);
        setChartInstance(chart);

        return () => {
            chart.dispose();
        };
    }, []);

    useEffect(() => {
        // console.log(chartRef.current);
        if (!chartInstance || !data) return;
        chartInstance.setOption({
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: data?.map(item => item.username)
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {
                        name: params.uuid
                    }
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data?.[0].ju_list
            },
            yAxis: {
                type: 'value'
            },
            series: data?.map((item, index) => ({
                name: item.username,
                type: 'line',
                data: item.score_list
            }))
        });
    }, [data]);

    useEffect(() => {
        const handleResize = () => {
            if (!chartInstance) return;
            chartInstance.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [chartInstance]);

    return (
        <div>
            <a onClick={() => navigate(-1)}>&lt; 返回</a>
            <Spin spinning={!data}>
                <Row style={{ marginTop: 16 }}>
                    <Col span={16}>
                        <div ref={chartRef}
                            style={{
                                height: 500,
                                padding: 16,
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.6)'
                            }} />
                    </Col>
                    <Col span={8} style={{ paddingLeft: 16 }}>
                        <Space direction="vertical">
                            <Typography.Paragraph copyable={{
                                tooltips: ['复制牌谱链接', '已复制'],
                                text: paipu
                            }}>
                                牌谱ID: {params.uuid}
                            </Typography.Paragraph>
                            <Space size='middle' split>
                                <Typography.Link href={paipu} target="_blank">
                                    查看牌谱(雀魂) <LinkOutlined />
                                </Typography.Link>
                                <Typography.Link href={`https://mjai.ekyu.moe/zh-cn.html?url=${encodeURIComponent(paipu)}`} target="_blank">
                                    AI检讨(Mortal) <LinkOutlined />
                                </Typography.Link>
                            </Space>
                            <Table dataSource={data} columns={columns} pagination={{ hideOnSinglePage: true }} />
                        </Space>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
}

export default RecordDetail;