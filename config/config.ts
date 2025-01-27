import { defineConfig } from "umi";
import routes from "./routes";

export default defineConfig({
  // base: "/NJU-Riichi/",
  // publicPath: "/NJU-Riichi/",
  routes,
  mock: false,
  // history: { type: 'hash' },
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:8787',
    },
  },
  // headScripts: [
  //   {
  //     // Cloudflare Web Analytics
  //     src: 'https://static.cloudflareinsights.com/beacon.min.js',
  //     defer: true,
  //     'data-cf-beacon': '{"token": "86d141fbf6dc45ecb2530505f7110c11"}',
  //   },
  // ],
  metas: [
    {
      name: 'description',
      content: '\
南京大学里三交流会 \
立直麻将/雀魂/校内面麻 \
群号: 614346985 \
社团简介 \
南京大学里三交流会目前已有近700余名同好。群内聊\
天讨论气氛活跃，线上线下活动热情高涨,寒暑假期间\
有无门槛校内团队/个人赛举办，是交友娱乐、提升技术\
的绝佳选择~ \
仙林/鼓楼校内面麻 \
雀魂乱杀没意思，想和群友线下激战?仙林、鼓楼校区\
都有固定的校内面麻据点,再也不怕找不到面麻伙伴! \
仙林校区:四食堂水吧旁边 \
鼓楼校区:南园咖啡馆(常驻) \
全高赛战绩辉煌 \
除校内寒假团体赛和暑假个人赛外,南大多次参加全国\
高校立直麻将网络团体赛(全高赛) ,曾获得第二届全\
高赛亚军。全高赛大名单绝赞招新中，急缺雀圣及以上\
水平选手，欢迎新生力量加入! \
' },
    { name: 'keywords', content: '南京大学, 南大, NJU, 立直麻将, Riichi, Mahjong, 雀魂, Majsoul, 赛事, 里三杯' },
  ],
});