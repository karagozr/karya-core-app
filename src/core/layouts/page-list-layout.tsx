import React from 'react';
import './page-layout.scss';


export function PageListLayout({ children,pageRate= 'full' }: React.PropsWithChildren<{pageRate?: 'full' | 'half' }>) {

  return (
    <React.Fragment>
      <div className={'dx-card responsive-list-paddings'} style={{width: pageRate === 'half' ? "50%" : "100%"}}>
        {children}
      </div>
    </React.Fragment>
  )
}