import { getContests } from "@/services/api";
import { checkScope, wrapScope } from "@/util/auth";
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Card, Spin, theme } from "antd";
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

  // const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  // const [couldUpdate, setCouldUpdate] = useState(false);
  // const [token, setToken] = useState<string>('');

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     const scope = 'update:contest';
  //     getAccessTokenSilently(wrapScope(scope)).then((token) => {
  //       const couldUpdate = checkScope(token, scope);
  //       setCouldUpdate(couldUpdate);
  //       setToken(token);
  //     });
  //   }
  // }, [isAuthenticated]);

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

  return (
    <div style={{ marginTop: 32, padding: '0 48px' }}>
      <h1>赛事列表</h1>
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

export default ContestPage;
