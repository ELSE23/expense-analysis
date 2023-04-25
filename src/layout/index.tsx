import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './style.module.scss';

const Layout = () => {
  return (
    <div className={styles.layout}>
      <Outlet />
    </div>
  );
};

export default Layout;
