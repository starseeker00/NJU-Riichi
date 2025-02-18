import React from 'react';
import { FloatButton, Layout, Menu, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'umi';
import routes from '../../config/routes';
import './index.less';
import LoginButton from '@/components/login';
import SupportButton from '@/components/support';

const { Header, Content, Footer } = Layout;

const AppLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  // console.log(location);

  return (
    <Layout style={{ minHeight: '100vh', position: 'relative' }}>
      <div className='bg' />
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname.split('/')[1] || 'home']}
          items={
            routes.filter(route => route.nav)
              .map((route) => ({
                key: route.path.slice(1),
                label: <Link to={route.path}>{route.title}</Link>,
              }))
          }
          style={{ flex: 1, minWidth: 0 }}
        />
        <SupportButton style={{ marginRight: 16 }} />
        <LoginButton />
      </Header>
      <Content>
        <div
          style={{
            // background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
            position: 'relative',
          }}
        >
          <Outlet />
        </div>
        <FloatButton.BackTop visibilityHeight={200} />
      </Content>
    </Layout>
  );
};

export default AppLayout;