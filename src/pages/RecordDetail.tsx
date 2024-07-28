import { getRecordDetail } from '@/services/api';
import { Spin } from 'antd';
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

const RecordDetail = () => {
    const navigate = useNavigate()
    const params = useParams<{ uuid: string }>();

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
        <Spin spinning={!data}>
            <div>
                <a onClick={() => navigate(-1)}>&lt; 返回</a>
                <div ref={chartRef} style={{ width: '100%', height: 500 }}></div>
            </div>
        </Spin>
    );
}

export default RecordDetail;