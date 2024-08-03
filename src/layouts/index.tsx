import React from 'react';
import { FloatButton, Layout, Menu, theme } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'umi';
import routes from '../../config/routes';
import './index.less';

const { Header, Content, Footer } = Layout;

const AppLayout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  // console.log(location);

  return (
    <Layout>
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
      </Header>
      <Content style={{ marginTop: 32, padding: '0 48px' }}>
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </div>
        <FloatButton.BackTop visibilityHeight={200} />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©2024 Created by 青岚
      </Footer>
    </Layout>
  );
};

export default AppLayout;