
export function wrapScope(scope: string) {
    return {
        authorizationParams: {
            audience: 'https://nju-riichi.pages.dev/api/check',
            scope,
        },
    };
}

export function checkScope(token: string, scope: string) {
    const hasScope = JSON.parse(atob(token.split('.')[1])).scope.split(' ')
    return scope.split(' ').every((s) => hasScope.includes(s));
}