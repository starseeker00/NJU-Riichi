import { CheckSquareTwoTone, NotificationTwoTone } from "@ant-design/icons";

import './index.less';
import poster from '@/assets/poster.jpeg';
import { Card } from "antd";

export default function HomePage() {
  return (
    <div className="home_page_container">
      <div className="poster_container">
        <img src={poster} alt="poster" />
      </div>
      <Card className="card_container" title="介绍">
        立直，一发，我闭着眼🎵 <br />
        门染手看不见，你沉醉了没❓ <br />
        自摸，里三，我不停歇🎤 <br />
        模糊了年岁，立直的点棒被我拍碎💃 <br />
        你好，这里是南京大学里三交流会～🀄 <br />
      </Card>
      <Card className="card_container" title="后续更新计划">
        <ul>
          <li><CheckSquareTwoTone />（优先）赛事成绩统计</li>
          <li><CheckSquareTwoTone />（可能）类似ml的局内分数变化</li>
          <li><CheckSquareTwoTone />（可能）类似牌谱屋的数据统计</li>
          <li><CheckSquareTwoTone />（新）牌谱和数据的过滤及排序功能</li>
          <li>（持续）页面美化</li>
          <li>（更多）欢迎向我提建议</li>
        </ul>
      </Card>
      <Card className="card_container" title={
        <span>公告 <NotificationTwoTone /></span>
      }>
        第12届南京大学“立直一发自摸里三”杯立直麻将校内个人赛开放报名!
        浪速赞助，奖励丰厚，欢迎各位热爱立直麻将的朋友前来参赛🎉 <br />
        同时，我们真诚地邀请24级新同学加入里三交流会并积极参赛，未见其人，先观其牌技🥺 <br />
        比赛时间：海选将于8月10日晚19:00在雀魂麻将开始，报名请扫描下方二维码入群，在群公告里填写报名信息✔ <br />
        <br /> 无论你是麻将新手，还是资深玩家，只要你热爱麻将，就请大胆地来挑战！
      </Card>
      <Card className="card_container" title="赞助">
        还没有赞助哦
      </Card>
    </div>
  );
}
