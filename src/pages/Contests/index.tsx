import { gameModeMap, ruleMap } from "@/const/majsoul";
import { useAuth } from "@/hooks/auth";
import { addOrUpdateContest, fetchContestInfo, getContests } from "@/services/api";
import { checkScope, wrapScope } from "@/util/auth";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Card, DatePicker, Form, Input, message, Modal, Select, Space, Spin, theme } from "antd";
import { use } from "echarts/types/src/extension.js";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "umi";


interface Contest {
  id: number;
  contest_short_id: number;
  contest_id: number;
  name: string;
  nickname: string;
  start_time: number;
  finish_time: number;
  game_mode: number;
  game_property: number;
  rule: number;
  description: string;
  last_update: number;
  divide_equally: number;
}

const ContestPage = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { user, isAuthenticated, couldUpdate, token } = useAuth();

  const navigate = useNavigate();

  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getContests().then((res) => {
      setContests(res.data);
      setLoading(false);
    });
  }, []);

  const filterContests = useMemo(() => {
    return contests
      .reduce((acc, contest) => {
        const now = Date.now() / 1000;
        if (contest.start_time < now && contest.finish_time > now) {
          acc[0].push(contest);
        } else if (contest.finish_time < now) {
          acc[1].push(contest);
        } else {
          acc[2].push(contest);
        }
        return acc;
      }, [[] as Contest[], [], []])
      .map((contests, index) => ({
        label: [
          <>
            <ClockCircleOutlined />
            <span style={{ marginLeft: 8 }}>进行中</span>
          </>,
          <>
            <CheckCircleOutlined />
            <span style={{ marginLeft: 8 }}>已结束</span>
          </>,
          <>
            <ExclamationCircleOutlined />
            <span style={{ marginLeft: 8 }}>未开始</span>
          </>
        ][index],
        children: contests,
      }));
  }, [contests]);

  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ marginTop: 32, padding: '0 48px' }}>
      <div>
        <h1>赛事列表</h1>
        {couldUpdate && <Button type="primary" onClick={() => setShowModal(true)}>添加赛事</Button>}
      </div>
      <ContestInfoModal open={showModal} onClose={() => setShowModal(false)} />
      {
        loading ? <Spin size="large" /> :
          filterContests.map((group) => (
            !!group.children?.length && (
              <>
                <h2>{group.label}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {
                    group.children.map((contest) => (
                      <Card
                        key={contest.id}
                        title={contest.name}
                        style={{ width: 300, margin: 8 }}
                        extra={
                          <Button
                            type="link"
                            onClick={() => navigate(`/contests/${contest.contest_id}/players`)}
                          >
                            进入
                          </Button>
                        }
                      >
                        赛事号： {contest.contest_short_id} <br />
                        {contest.description}
                      </Card>
                    ))
                  }
                </div>
              </>
            )
          ))
      }
    </div>
  );
};

const ContestInfoModal = (props: { open: boolean, onClose: () => void }) => {

  const [form] = Form.useForm();
  const [flag, setFlag] = useState(false);

  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState('');

  const reset = () => {
    form.resetFields();
    setFlag(false);
    setTip('');
  }

  const submit = (values: any) => {
    setLoading(true);
    console.log('Received values:', values);
    if (!flag) {
      setTip('正在获取赛事信息，请稍候...');
      // console.log('Received values:', values);
      fetchContestInfo({ contest_id: values.contest_short_id })
        .then((res) => {
          form.setFieldsValue({
            ...res.data,
            start_time: moment(res.data.start_time * 1000),
            finish_time: moment(res.data.finish_time * 1000),
          });
          setFlag(true);
          setTip('');
        })
        .catch((error) => {
          setTip('获取赛事信息失败，请检查赛事号是否正确');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setTip('正在添加赛事，请稍候...');
      addOrUpdateContest({
        ...values,
        start_time: Math.floor(values.start_time.valueOf() / 1000),
        finish_time: Math.floor(values.finish_time.valueOf() / 1000),
      })
        .then((res) => {
          props.onClose();
          Modal.success({ title: '添加赛事成功', content: '请在赛事列表中查看新添加的赛事' });
          reset();
        })
        .catch((error) => {
          setTip('添加赛事失败，请稍后重试');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  return (
    <Modal
      open={props.open}
      onCancel={props.onClose}
      title="添加赛事"
      footer={null}
      maskClosable={false}
      centered
      width={800}
    >
      <Form
        name="contestForm"
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={submit}
        autoComplete="off"
      >
        <Form.Item
          label="6位赛事号"
          name="contest_short_id"
          rules={[{ len: 6, message: '请输入6位赛事号!' }]}
        >
          <Input maxLength={6} disabled={loading || flag} />
        </Form.Item>

        {
          flag && (
            <>
              <Form.Item label="赛事ID" name="contest_id">
                <Input disabled />
              </Form.Item>

              <Form.Item label="赛事名称" name="name">
                <Input disabled />
              </Form.Item>

              <Form.Item label="赛事简称（可选）" name="nickname">
                <Input />
              </Form.Item>

              <Form.Item label="开始时间" name="start_time">
                <DatePicker disabled />
              </Form.Item>

              <Form.Item label="结束时间" name="finish_time">
                <DatePicker disabled />
              </Form.Item>

              <Form.Item label="比赛模式" name="game_mode">
                <Select
                  disabled
                  options={Object.entries(gameModeMap).map(([key, value]) => ({
                    label: value,
                    value: Number(key),
                  }))}
                />
              </Form.Item>

              <Form.Item label="计分规则" name="rule">
                <Select
                  disabled
                  options={Object.entries(ruleMap).map(([key, value]) => ({
                    label: value,
                    value: Number(key),
                  }))}
                />
              </Form.Item>

              <Form.Item label="比赛描述" name="description">
                <Input.TextArea disabled />
              </Form.Item>

              <Form.Item label="比赛性质" name="game_property" initialValue={0}>
                <Select
                  options={[
                    { label: '个人赛', value: 0 },
                    { label: '团体赛', value: 1 },
                  ]}
                />
              </Form.Item>

              <Form.Item label="同分是否平分顺位马" name="divide_equally" initialValue={0}>
                <Select
                  options={[
                    { label: '是', value: 1 },
                    { label: '否', value: 0 },
                  ]}
                />
              </Form.Item>
            </>
          )
        }

        <Space style={{ display: 'flex', justifyContent: 'center' }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            {flag ? '确认添加赛事' : '获取赛事信息'}
          </Button>
          <Button disabled={loading} onClick={reset}>
            重置
          </Button>
          {tip && <span style={{ color: 'red' }}>{tip}</span>}
        </Space>
      </Form>

    </Modal >
  )
}

export default ContestPage;
