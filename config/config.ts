import { defineConfig } from "umi";
import routes from "./routes";

export default defineConfig({
  // base: "/NJU-Riichi/",
  publicPath: "/NJU-Riichi/",
  routes,
  history: { type: 'hash' },
  npmClient: 'npm',
});