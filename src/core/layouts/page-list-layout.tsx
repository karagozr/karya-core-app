import React from 'react';
import './page-layout.scss';


export function PageListLayout({ children,pageRate= 'full' }: React.PropsWithChildren<{pageRate?: 'full' | 'half' }>) {

  return (
    <React.Fragment>
      <div className={`dx-card responsive-list-paddings ${pageRate === 'half' ? 'responsive-list-paddings-half' : ''}`} >
        {children}
      </div>
    </React.Fragment>
  )
}