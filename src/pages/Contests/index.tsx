import { getContests } from "@/services/api";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { ConfigProvider, Layout, Menu, Spin, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { MenuItemGroupType } from "antd/es/menu/interface";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "umi";


interface Contest {
  id: number;
  contest_id: number;
  name: string;
  nickname: string;
  start_time: number;
  finish_time: number;
  description: string;
}

const ContestPage = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate();

  const [contests, setContests] = useState<Contest[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    getContests().then((res) => {
      setContests(res.data);
      if (location.pathname === '/contests' && res.data.length) {
        const first = res.data.filter((contest: Contest) => {
          const now = Date.now() / 1000;
          return now >= contest.start_time && now <= contest.finish_time;
        })[0];
        if (first) {
          navigate(`${first.contest_id}/players`, { replace: true });
        } else {
          navigate(`${res.data[0].contest_id}/players`, { replace: true });
        }
      }
    });
  }, []);

  const [contestId, setContestId] = useState(0);
  const [tab, setTab] = useState<'players' | 'records'>('players');

  useEffect(() => {
    // console.log(location.pathname);
    const [e, t] = location.pathname.trim().split('/').slice(2);
    setContestId(Number(e));
    setTab(t as 'players' | 'records');
  }, [location.pathname]);


  function filterContests(contestList: Contest[]) {
    const contestGroup: MenuItemGroupType[] = [
      {
        label: (
          <>
            <ClockCircleOutlined />
            <span style={{ marginLeft: 8 }}>进行中</span>
          </>
        ),
        key: 'ongoing',
        type: 'group',
        children: contestList
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
        children: contestList
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
        children: contestList
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
    return contestGroup;
  }

  return (
    <Spin spinning={contests.length === 0} size="large">
      <Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
        <Sider style={{ background: colorBgContainer }}
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          collapsedWidth={0}
          zeroWidthTriggerStyle={{ top: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[contestId.toString()]}
            items={filterContests(contests).filter((group) => group.children?.length)}
            onClick={({ key }) => { navigate(`${key}/players`) }}
          />
        </Sider>
        {contests.length > 0 &&
          <Content style={{ padding: '0 52px', minHeight: 280 }}>
            <h2>{contests.filter(item => item.contest_id === contestId)[0]?.name}</h2>
            <p>{contests.filter(item => item.contest_id === contestId)[0]?.description}</p>
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
                    key: 'records',
                    label: '牌谱记录',
                  },
                ]}
                onClick={({ key }) => { navigate(`${contestId}/${key}`, { replace: true }) }}
                style={{ marginBottom: 8 }}
              />
              <Outlet />
            </div>
          </Content>
        }
      </Layout>
    </Spin>
  );
};

export default ContestPage;
