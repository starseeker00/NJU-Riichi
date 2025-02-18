import { StatisticTabType } from "@/const";
import { getContests, updateContest } from "@/services/api";
import { checkScope, wrapScope } from "@/util/auth";
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ReloadOutlined, SettingOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Layout, Menu, Modal, Space, Spin, Tag, theme, Tooltip } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { MenuItemGroupType } from "antd/es/menu/interface";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "umi";


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

const ContestDetail = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [couldUpdate, setCouldUpdate] = useState(false);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      const scope = 'update:contest';
      getAccessTokenSilently(wrapScope(scope)).then((token) => {
        const couldUpdate = checkScope(token, scope);
        setCouldUpdate(couldUpdate);
        setToken(token);
      });
    }
  }, [isAuthenticated]);

  const location = useLocation();
  const navigate = useNavigate();

  const [contests, setContests] = useState<Contest[]>([]);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    getContests().then((res) => {
      setContests(res.data);
    });
  }, []);

  const filterContests = useMemo((): MenuItemGroupType[] => {
    return [
      {
        label: (
          <>
            <ClockCircleOutlined />
            <span style={{ marginLeft: 8 }}>进行中</span>
          </>
        ),
        key: 'ongoing',
        type: 'group',
        children: contests
          .filter((contest) => {
            const now = Date.now() / 1000;
            return now >= contest.start_time && now <= contest.finish_time;
          })
          .map((contest) => ({
            key: contest.contest_id.toString(),
            label: contest.nickname || contest.name,
          })),
      },
      {
        label: (
          <>
            <ExclamationCircleOutlined />
            <span style={{ marginLeft: 8 }}>未开始</span>
          </>
        ),
        key: 'notStarted',
        type: 'group',
        children: contests
          .filter((contest) => {
            const now = Date.now() / 1000;
            return now < contest.start_time;
          })
          .map((contest) => ({
            key: contest.contest_id.toString(),
            label: contest.nickname || contest.name,
          })),
      },
      {
        label: (
          <>
            <CheckCircleOutlined />
            <span style={{ marginLeft: 8 }}>已结束</span>
          </>
        ),
        key: 'ended',
        type: 'group',
        children: contests
          .filter((contest) => {
            const now = Date.now() / 1000;
            return now > contest.finish_time;
          })
          .map((contest) => ({
            key: contest.contest_id.toString(),
            label: contest.nickname || contest.name,
          })),
      },
    ];
  }, [contests]);

  const [contestId, setContestId] = useState(0);
  const [tab, setTab] = useState<StatisticTabType>('players');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // console.log(location.pathname);
    const [e, t] = location.pathname.trim().split('/').slice(2);
    setContestId(Number(e));
    setTab(t as StatisticTabType);
  }, [location.pathname]);

  const selectedContest = useMemo(() => (
    contests.filter((item) => item.contest_id === contestId)[0]
  ), [contestId, contests]);

  const [showMore, setShowMore] = useState(false);

  return (
    <Spin spinning={contests.length === 0} size="large">
      <Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
        <Sider style={{ background: colorBgContainer }}
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          collapsedWidth={0}
          trigger={
            collapsed ?
              <Button size="small"
                icon={<UnorderedListOutlined />}
                style={{ writingMode: 'vertical-lr', height: 90 }}
              >赛事列表</Button>
              : <Button size="small" icon={<MenuFoldOutlined />} />
          }
          zeroWidthTriggerStyle={
            collapsed ? { right: 0, height: 100 } : { right: 0, top: 0 }
          }
        >
          <Menu
            mode="inline"
            selectedKeys={[contestId.toString()]}
            items={filterContests.filter((group) => group.children?.length)}
            onClick={({ key }) => { navigate(`/contests/${key}/players`) }}
          />
        </Sider>
        {contests.length > 0 &&
          <Content style={{ paddingLeft: 24, minHeight: 280 }}>
            <div style={{ position: 'relative', minHeight: 50 }}>
              <h2>
                {selectedContest?.name}
                <Button icon={<SettingOutlined />} style={{ marginLeft: 8 }} onClick={() => setShowMore(true)} />
              </h2>
              <Modal
                title="赛事信息"
                open={showMore}
                onCancel={() => setShowMore(false)}
                footer={null}
              >
                <Space direction="vertical">
                  <div>
                    <span style={{ color: 'gray' }}>比赛时间：</span>
                    <Tag color="blue">
                      <CalendarOutlined style={{ paddingRight: 8 }} />
                      {new Date(selectedContest?.start_time * 1000).toLocaleDateString()} - {new Date(selectedContest?.finish_time * 1000).toLocaleDateString()}
                    </Tag>
                  </div>
                  <div>
                    <span style={{ color: 'gray' }}>比赛模式：</span>
                    <Tag color="blue">{selectedContest?.game_mode > 10 ? '三麻' : '四麻'}</Tag>
                  </div>
                  <div>
                    <span style={{ color: 'gray' }}>比赛性质：</span>
                    <Tag color="blue">{selectedContest?.game_property === 0 ? '个人赛' : '团体赛'}</Tag>
                  </div>
                  <div>
                    <span style={{ color: 'gray' }}>同分是否平分顺位马：</span>
                    <Tag color="blue">{selectedContest?.divide_equally === 0 ? '否' : '是'}</Tag>
                  </div>
                </Space>
              </Modal>
              <p>{selectedContest?.description}</p>
              <div style={{ position: 'absolute', top: 0, right: 0, direction: 'rtl' }}>
                <div>
                  <Button
                    type="dashed"
                    icon={<ReloadOutlined />}
                    disabled={!couldUpdate}
                    loading={updating}
                    onClick={() => {
                      setUpdating(true);
                      updateContest(contestId, token)
                        .then(() => {
                          Modal.success({ content: '更新成功' });
                          setUpdating(false);
                        })
                        .catch(() => {
                          Modal.error({ content: '更新失败' });
                          setUpdating(false);
                        });
                    }}
                  >更新数据</Button>
                </div>
                <div style={{ color: 'gray' }}>
                  最后更新时间：{new Date(selectedContest?.last_update).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <Menu
                mode="horizontal"
                selectedKeys={[tab]}
                items={[
                  {
                    key: 'players',
                    label: '玩家统计',
                  },
                  {
                    key: 'teams',
                    label: '队伍统计',
                    disabled: selectedContest?.game_property !== 1,
                  },
                  {
                    key: 'records',
                    label: '牌谱记录',
                  },
                  {
                    key: 'schedule',
                    label: '赛程',
                  }
                ]}
                onClick={({ key }) => { navigate(`${key}`, { replace: true }) }}
                style={{ marginBottom: 8 }}
              />
              <Outlet context={{
                game_mode: selectedContest?.game_mode,
                game_property: selectedContest?.game_property,
                rule: selectedContest?.rule,
              }} />
            </div>
          </Content>
        }
      </Layout>
    </Spin >
  );
};

export default ContestDetail;
