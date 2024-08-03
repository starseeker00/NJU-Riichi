import { defineConfig } from "umi";
import routes from "./routes";

export default defineConfig({
  // base: "/NJU-Riichi/",
  // publicPath: "/NJU-Riichi/",
  routes,
  metas: [
    { name: 'description', content: '南京大学立直麻将交流会官网' },
    { name: 'keywords', content: '南京大学, 南大, NJU, 立直麻将, Riichi, Mahjong, 雀魂, Majsoul, 赛事, 里三杯' },
  ],
  mock: false,
  history: { type: 'hash' },
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:8787',
    },
  },
});