import { defineApp, matchRoutes } from 'umi';
export default defineApp({
    onRouteChange: ({ clientRoutes, location }) => {
        const route = matchRoutes(clientRoutes, location.pathname)?.[1].route;
        if (route) {
            document.title = (route.title || 'Not Found') + ' - NJU里三交流会';
        }
    }
});