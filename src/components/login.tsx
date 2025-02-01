
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
    const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } =
        useAuth0();

    if (isAuthenticated) {
        return (
            <div style={{ color: 'white' }}>
                Hello {user?.name}{' '}
                <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                    Log out
                </button>
            </div>
        );
    } else {
        return <button onClick={() => loginWithRedirect()}>Log in</button>;
    }
};

export default LoginButton;