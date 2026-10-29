import React from 'react';
import './home.scss';
import { DashPage, PageCustomLayout } from '../../core';

export function Home() {
  return (
    <DashPage caption="Home" breadcrumb={{
      path:"Home",
    }} />
  );
}
