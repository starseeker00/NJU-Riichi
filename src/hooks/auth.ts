import { checkScope, wrapScope } from "@/util/auth";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export const useAuth = () => {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [couldUpdate, setCouldUpdate] = useState(false);
    const [token, setToken] = useState<string>('');

    useEffect(() => {
        if (isAuthenticated) {
            const scope = 'update:contest';
            getAccessTokenSilently(wrapScope(scope)).then((token) => {
                const couldUpdate = checkScope(token, scope);
                setCouldUpdate(couldUpdate);
                setToken(token);
                localStorage.setItem('token', token);
            });
        }
    }, [isAuthenticated]);

    return {
        user,
        isAuthenticated,
        couldUpdate,
        token,
    };
}