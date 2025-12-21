import React from 'react';
import styles from './PageLayout.module.scss';
import { Outlet } from 'react-router-dom';

export const PageLayout: React.FC = () => {
  return (
    <div className={styles.container}>
      <Outlet />
    </div>
  );
};
