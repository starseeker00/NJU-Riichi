import { Table } from "antd";


const DocsPage = () => {
  const data = [
    {
      '0': { nickname: '宽恕者茴香', seat: 0, point: 6700 },
      '1': { nickname: '有一点迷茫', seat: 1, point: 37500 },
      '2': { nickname: '蕉蕉蕉666', seat: 2, point: 50100 },
      '3': { nickname: '園城寺丶怜', seat: 3, point: 5700 },
      key: '240629-a2561f9e-f53d-4a23-98b3-2788ff7d947f'
    },
    {
      '0': { nickname: '拍泡泡', seat: 0, point: 1200 },
      '1': { nickname: '若葉こはく', seat: 1, point: 16100 },
      '2': { nickname: '米米', seat: 2, point: 65400 },
      '3': { nickname: '无法回避的厄运', seat: 3, point: 17300 },
      key: '240629-ac5fa650-314d-4ab8-84d5-a3e9de6e6f6d'
    },
    {
      '0': { nickname: 'xlww', seat: 0, point: 46700 },
      '1': { nickname: '~iris~', seat: 1, point: 25100 },
      '2': { nickname: '喀斯特那抹蓝', seat: 2, point: 5000 },
      '3': { nickname: '正义一番胡', seat: 3, point: 23200 },
      key: '240629-ef2ee446-af06-4f38-97cd-d0a7c18f202e'
    },
    {
      '0': { nickname: '边听歌边玩', seat: 0, point: 25400 },
      '1': { nickname: '珊瑚瑚', seat: 1, point: 29700 },
      '2': { nickname: '于是郎和', seat: 2, point: -800 },
      '3': { nickname: '未来的约定之时', seat: 3, point: 45700 },
      key: '240629-dd48205d-df64-452c-acaa-8f6dc8d98985'
    },
    {
      '0': { nickname: '我战无不胜', seat: 0, point: 38400 },
      '1': { nickname: '悠家小兔', seat: 1, point: 19300 },
      '2': { nickname: '海上幻想师', seat: 2, point: 42600 },
      '3': { nickname: '眉清目秀牛', seat: 3, point: -300 },
      key: '240629-2107f683-e8b8-4df6-ac13-bb00ed76981c'
    },
    {
      '0': { nickname: 'lhylllll', seat: 0, point: 50600 },
      '1': { nickname: '夜雨璇', seat: 1, point: 9900 },
      '2': { nickname: '果断直接白给', seat: 2, point: 8000 },
      '3': { nickname: '混沌恶', seat: 3, point: 31500 },
      key: '240629-c1eb0462-bec7-4997-b45c-a1d08b0f6e1a'
    },
    {
      '0': { nickname: '偉布拉特', seat: 0, point: 32100 },
      '1': { nickname: '散情情情情', seat: 1, point: 32100 },
      '2': { nickname: 'Leoooooooo', seat: 2, point: 10300 },
      '3': { nickname: '反扑QAQ', seat: 3, point: 25500 },
      key: '240629-14e84365-69d9-4ee0-baab-8d5136a3e679'
    },
    {
      '0': { nickname: 'Together丶', seat: 0, point: 20800 },
      '1': { nickname: '痴呆镜小To', seat: 1, point: 52500 },
      '2': { nickname: '我还不跟你急', seat: 2, point: 29300 },
      '3': { nickname: '泷川爱花', seat: 3, point: -2600 },
      key: '240629-6c67efde-9fe5-461d-ae74-c2aac9570512'
    },
    {
      '0': { nickname: '听慢歌', seat: 0, point: 38700 },
      '1': { nickname: '赤井', seat: 1, point: 23200 },
      '2': { nickname: '未来的约定之时', seat: 2, point: 31200 },
      '3': { nickname: '珊瑚瑚', seat: 3, point: 6900 },
      key: '240629-0e6b9d73-ff4e-406e-a516-2273ae4778e2'
    },
    {
      '0': { nickname: '赵小垂', seat: 0, point: 21500 },
      '1': { nickname: '悠家小兔', seat: 1, point: 31500 },
      '2': { nickname: '孽力回馈', seat: 2, point: 13200 },
      '3': { nickname: '我战无不胜', seat: 3, point: 33800 },
      key: '240629-e45423f5-b512-4ca3-b18c-2f3c0bf219e6'
    },
    {
      '0': { nickname: '眉清目秀牛', seat: 0, point: 24500 },
      '1': { nickname: '麻将陷阱', seat: 1, point: -2500 },
      '2': { nickname: '萧瑟鲜贝', seat: 2, point: 54000 },
      '3': { nickname: '園城寺丶怜', seat: 3, point: 24000 },
      key: '240629-e5a2bf46-7661-468c-9095-339700a1a8ff'
    },
    {
      '0': { nickname: '拍泡泡', seat: 0, point: 22700 },
      '1': { nickname: '若葉こはく', seat: 1, point: 45900 },
      '2': { nickname: '水望', seat: 2, point: 9200 },
      '3': { nickname: 'unsad', seat: 3, point: 22200 },
      key: '240629-d0bfcb93-80fd-4338-98da-ea48479ef350'
    },
    {
      '0': { nickname: '铃木光　', seat: 0, point: 19000 },
      '1': { nickname: '宽恕者茴香', seat: 1, point: 26400 },
      '2': { nickname: '照阿', seat: 2, point: 36800 },
      '3': { nickname: '于是郎和', seat: 3, point: 17800 },
      key: '240629-1e1de957-b54b-46be-a860-fd932655bf95'
    },
    {
      '0': { nickname: '这游戏谁在赢啊', seat: 0, point: 11900 },
      '1': { nickname: '远坂凛', seat: 1, point: 25400 },
      '2': { nickname: '米米', seat: 2, point: 39600 },
      '3': { nickname: 'dota小鱼', seat: 3, point: 23100 },
      key: '240629-cfc8b766-d12e-4d3a-a267-3e9b7e51f47a'
    },
    {
      '0': { nickname: '枣苗', seat: 0, point: 12800 },
      '1': { nickname: '喀斯特那抹蓝', seat: 1, point: 23400 },
      '2': { nickname: '无法回避的厄运', seat: 2, point: 36000 },
      '3': { nickname: '藤林杏', seat: 3, point: 27800 },
      key: '240629-5a106d50-362a-4f93-a691-565aa1bb9be5'
    },
    {
      '0': { nickname: 'OldFour', seat: 0, point: 30000 },
      '1': { nickname: 'アザミ嬢', seat: 1, point: 32000 },
      '2': { nickname: '正义一番胡', seat: 2, point: 18800 },
      '3': { nickname: '边听歌边玩', seat: 3, point: 19200 },
      key: '240629-afe2946b-37b7-4f02-8b6f-dedf76b85d13'
    },
    {
      '0': { nickname: '无限飓风号', seat: 0, point: 5500 },
      '1': { nickname: '我还不跟你急', seat: 1, point: 18500 },
      '2': { nickname: 'xlww', seat: 2, point: 60300 },
      '3': { nickname: '小睡熊', seat: 3, point: 15700 },
      key: '240629-e635be9b-78ba-450e-837c-4c346e26eae3'
    },
    {
      '0': { nickname: '光的行方', seat: 0, point: 21400 },
      '1': { nickname: 'Together丶', seat: 1, point: 19900 },
      '2': { nickname: '狄不云', seat: 2, point: 18300 },
      '3': { nickname: '痴呆镜小To', seat: 3, point: 40400 },
      key: '240629-8d11f0ec-b345-4609-9e7d-ce94c20bb6a6'
    },
    {
      '0': { nickname: '白衣飘雪灬', seat: 0, point: 21400 },
      '1': { nickname: '一个大凰墟', seat: 1, point: 30000 },
      '2': { nickname: '混沌恶', seat: 2, point: 32000 },
      '3': { nickname: '第一张绝不打字', seat: 3, point: 16600 },
      key: '240629-5cef9c5e-395e-43c7-aa82-78e5d76b2a29'
    },
    {
      '0': { nickname: '果断直接白给', seat: 0, point: 62200 },
      '1': { nickname: '~iris~', seat: 1, point: -400 },
      '2': { nickname: 'lhylllll', seat: 2, point: 23900 },
      '3': { nickname: '夜雨璇', seat: 3, point: 14300 },
      key: '240629-c19bfff8-97b7-4874-8afd-afb4482a010c'
    }
  ]

  const columns = [
    {
      title: '东',
      dataIndex: '0',
      render: ({ nickname, point }) => <span>{nickname} ({point})</span>
    },
    {
      title: '南',
      dataIndex: '1',
      render: ({ nickname, point }) => <span>{nickname} ({point})</span>
    },
    {
      title: '西',
      dataIndex: '2',
      render: ({ nickname, point }) => <span>{nickname} ({point})</span>
    },
    {
      title: '北',
      dataIndex: '3',
      render: ({ nickname, point }) => <span>{nickname} ({point})</span>
    }
  ]

  return (
    <div>
      <h2>第12届南京大学立直一发自摸里三杯麻将联赛个人赛</h2>
      <p>还没有数据（训练场的也无，这里用四象战的数据做测试）</p>
      <Table dataSource={data} columns={columns} />
    </div>
  );
};

export default DocsPage;
