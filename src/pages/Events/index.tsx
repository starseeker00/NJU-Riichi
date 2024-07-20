import { getEvents } from "@/services/api";
import { Layout, Menu, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { MenuItemGroupType } from "antd/es/menu/interface";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "umi";


interface GameEvent {
  id: number;
  eventId: number;
  name: string;
  nickName: string;
  startTimestamp: number;
  endTimestamp: number;
  description: string;
}

const EventsPage = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate();

  const [eventId, setEventId] = useState(0);
  const [tab, setTab] = useState<'players' | 'records'>('players');

  useEffect(() => {
    // console.log(location.pathname);
    const [e, t] = location.pathname.trim().split('/').slice(2);
    setEventId(Number(e));
    setTab(t as 'players' | 'records');
  }, [location.pathname]);


  const [events, setEvents] = useState<GameEvent[]>([]);

  useEffect(() => {
    getEvents().then((res) => {
      setEvents(res.data);
      if (location.pathname === '/events') {
        const first = res.data.filter((event: GameEvent) => {
          const now = Date.now();
          return now >= event.startTimestamp && now <= event.endTimestamp;
        })[0];
        navigate(`${first.eventId}/players`, { replace: true });
      }
    });
  }, []);

  function filterEvents(eventList: GameEvent[]) {
    const eventGroup: MenuItemGroupType[] = [
      {
        label: '进行中',
        key: 'ongoing',
        type: 'group',
        children: eventList
          .filter((event) => {
            const now = Date.now();
            return now >= event.startTimestamp && now <= event.endTimestamp;
          })
          .map((event) => ({
            key: event.eventId.toString(),
            label: event.nickName,
          })),
      },
      {
        label: '未开始',
        key: 'notStarted',
        type: 'group',
        children: eventList
          .filter((event) => {
            const now = Date.now();
            return now < event.startTimestamp;
          })
          .map((event) => ({
            key: event.eventId.toString(),
            label: event.nickName,
          })),
      },
      {
        label: '已结束',
        key: 'ended',
        type: 'group',
        children: eventList
          .filter((event) => {
            const now = Date.now();
            return now > event.endTimestamp;
          })
          .map((event) => ({
            key: event.eventId.toString(),
            label: event.nickName,
          })),
      },
    ];
    return eventGroup;
  }

  return (
    <Layout
      style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
    >
      <Sider style={{ background: colorBgContainer }} width={240}>
        <Menu
          mode="inline"
          selectedKeys={[eventId.toString()]}
          items={filterEvents(events).filter((group) => group.children?.length)}
          onClick={({ key }) => { navigate(`${key}/players`) }}
        />
      </Sider>
      <Content style={{ padding: '0 24px', minHeight: 280 }}>
        <h2>{events.filter(item => item.eventId === eventId)[0]?.name}</h2>
        <p>{events.filter(item => item.eventId === eventId)[0]?.description}</p>
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
          onClick={({ key }) => { navigate(`${eventId}/${key}`, { replace: true }) }}
        />
        <Outlet />
      </Content>
    </Layout>
  );
};

export default EventsPage;
