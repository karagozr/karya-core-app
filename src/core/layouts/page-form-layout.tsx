import React  from 'react';
import './page-layout.scss';



export function PageFormLayout({children}: React.PropsWithChildren<{}>) {
  
  return (
    <React.Fragment>
      {/* <div className={'content-block'}>
        
      </div> */}

      <div className={'dx-card responsive-paddings'} >
            {children}
        </div>
    </React.Fragment>
)}