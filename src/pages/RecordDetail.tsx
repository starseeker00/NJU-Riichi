import MahjongTags from '@/components/MahjongTags';
import { getRecordDetail } from '@/services/api';
import { LinkOutlined } from '@ant-design/icons';
import { Col, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "umi";

interface RecordDetailData {
    username: string;
    lizhi: number;
    hule: number;
    chong: number;
    ju_list: string[];
    score_list: number[];
}

const columns = [
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
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags: string) => tags?.split(',').map((tag) => <MahjongTags tag={tag} />)
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
                ju_list: item.ju_list.split(','),
                score_list: item.score_list.split(',').map((score: string) => Number(score))
            }))
            setData(detailData);
        });
    }, [params.uuid]);

    const chartRef = useRef(null);

    useEffect(() => {
        // console.log(chartRef.current);
        const chartInstance = echarts.init(chartRef.current)
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


    return (
        <div>
            <a onClick={() => navigate(-1)}>&lt; 返回</a>
            <Spin spinning={!data}>
                <Row>
                    <Col span={16}>
                        <div ref={chartRef} style={{ height: 500 }}></div>
                    </Col>
                    <Col span={7} offset={1}>
                        <Space direction="vertical">
                            <Typography.Paragraph copyable={{
                                tooltips: ['复制牌谱链接', '已复制'],
                                text: paipu
                            }}>
                                牌谱ID: {params.uuid}
                            </Typography.Paragraph>
                            <Typography.Link href={paipu} target="_blank">查看牌谱<LinkOutlined /></Typography.Link>
                            <Table dataSource={data} columns={columns} pagination={{ hideOnSinglePage: true }} />
                        </Space>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
}

export default RecordDetail;