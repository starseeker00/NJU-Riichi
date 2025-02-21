
import { useAuth0 } from "@auth0/auth0-react";
import { Button, Space } from "antd";

const LoginButton = () => {
    const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } =
        useAuth0();

    if (isAuthenticated) {
        return (
            <Space
                style={{ color: 'white' }}
                direction="horizontal"
                size="middle"
            >
                <div>Hello {user?.name}</div>
                <Button
                    style={{ color: 'white', borderColor: 'white' }}
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                    Log out
                </Button>
            </Space>
        );
    } else {
        return <Button
            style={{ color: 'white', borderColor: 'white' }}
            onClick={() => loginWithRedirect()}>
            Log in
        </Button>;
    }
};

export default LoginButton;