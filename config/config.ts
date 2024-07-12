import { defineConfig } from "umi";
import routes from "./routes";

export default defineConfig({
  base: "/NJU-Riichi/",
  publicPath: "/NJU-Riichi/",
  routes,
  npmClient: 'npm',
});