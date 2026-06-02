import React from 'react';
import './page-layout.scss';

export function PageListLayout({ children }
  : React.PropsWithChildren<{}>) {

  return (
    <React.Fragment>
      <div className={'dx-card responsive-list-paddings'}>
        {children}
      </div>
    </React.Fragment>
  )
}