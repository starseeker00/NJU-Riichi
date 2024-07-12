import React from 'react';
import { Breadcrumb, Layout as Lyt, Menu, theme } from 'antd';
import { Outlet, useNavigate } from 'umi';
import routes from '../../config/routes';

const { Header, Content, Footer } = Lyt;

const Layout: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();

  return (
    <Lyt>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['/' + window.location.pathname.split('/').at(-1)]}
          onSelect={({ key }) => { navigate(key) }}
          items={
            routes.map((route) => ({
              key: route.path,
              label: route.name,
            }))
          }
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '0 48px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
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
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Lyt>
  );
};

export default Layout;