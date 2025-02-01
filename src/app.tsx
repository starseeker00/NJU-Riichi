import { Auth0Provider } from '@auth0/auth0-react';
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
        return React.createElement(Auth0Provider, {
            domain: 'dev-qh5vj1pjwwrk1yxt.us.auth0.com',
            clientId: 'VafOLjyKcHVHZRWVe0xTxxLOj4SSrPfH',
            authorizationParams: { 
                redirect_uri: window.location.origin,
                // audience: 'https://nju-riichi.pages.dev/api/check',
             },
        }, container);
    }
});

