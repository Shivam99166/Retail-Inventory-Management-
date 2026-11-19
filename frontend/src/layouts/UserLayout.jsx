import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from '../components/user/UserNavbar';
import UserFooter from '../components/user/UserFooter';

function UserLayout() {
  return (
    <div className="user-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <UserNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
}

export default UserLayout;
