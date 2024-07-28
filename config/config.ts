import { defineConfig } from "umi";
import routes from "./routes";

export default defineConfig({
  // base: "/NJU-Riichi/",
  // publicPath: "/NJU-Riichi/",
  routes,
  mock: false,
  history: { type: 'hash' },
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:8787',
    },
  },
});