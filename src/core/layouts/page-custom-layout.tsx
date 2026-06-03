import React from 'react';
import './page-layout.scss';

export function PageCustomLayout({ children }
  : React.PropsWithChildren<{}>) {

  return (
      <div className={'dx-card custom-page-card'} >
        {children}
      </div>
  )
}