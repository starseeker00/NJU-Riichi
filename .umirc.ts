import { defineConfig } from "umi";

export default defineConfig({
  base: "/NJU-Riichi/",
  publicPath: "/NJU-Riichi/",
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
  ],
  npmClient: 'npm',
});
