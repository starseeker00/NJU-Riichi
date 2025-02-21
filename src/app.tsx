import { Auth0Provider } from '@auth0/auth0-react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { defineApp, matchRoutes } from 'umi';
export default defineApp({
    onRouteChange: ({ clientRoutes, location }) => {
        const route = matchRoutes(clientRoutes, location.pathname)?.[1].route;
        if (route) {
            document.title = (route.title || 'Not Found') + ' - NJU里三交流会';
        }
    },
    rootContainer: (container) => {
        const themeProvider = React.createElement(ConfigProvider, {
            theme: {
                token: {
                    colorBgContainer: 'transparent',
                    colorBorder: 'gray',
                    colorBorderSecondary: 'gray',
                },
            }
        }, container);

        const authProvider = React.createElement(Auth0Provider, {
            domain: 'dev-qh5vj1pjwwrk1yxt.us.auth0.com',
            clientId: 'VafOLjyKcHVHZRWVe0xTxxLOj4SSrPfH',
            authorizationParams: {
                redirect_uri: window.location.origin,
                // audience: 'https://nju-riichi.pages.dev/api/check',
            },
        }, themeProvider);

        return authProvider;
    }
});

