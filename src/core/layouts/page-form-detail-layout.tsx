import React from 'react';
import { PageFormDetailTitle, type PageFormDetailTitleProps } from '../components';
import './page-layout.scss';

export interface IPageFormDetailLayoutProps {
    caption?: React.PropsWithChildren<PageFormDetailTitleProps>;
    pageType: 'form' | 'list'|'form-detail'|'custom';
    defaultCollapsed?: boolean;
    collapsible?: boolean;

}


export function PageFormDetailLayout({ caption, children, collapsible = true, defaultCollapsed = false }
    : React.PropsWithChildren<IPageFormDetailLayoutProps>) {
  return (
    <React.Fragment>
      <div >
        {collapsible ? (
          <details className={'dx-card responsive-paddings page-form-detail-card'} open={!defaultCollapsed}>
            <summary className={'page-form-detail-card-header'}>
              <PageFormDetailTitle {...caption} />
              <span className={'page-form-detail-card-toggle-button dx-icon dx-icon-chevrondown page-form-detail-card-toggle-button-collapsed'} aria-hidden={'true'} />
              <span className={'page-form-detail-card-toggle-button dx-icon dx-icon-chevronup page-form-detail-card-toggle-button-expanded'} aria-hidden={'true'} />
            </summary>
            <div className={'page-form-detail-card-body'}>
              {children}
            </div>
          </details>
        ) : (
          <div className={'dx-card responsive-paddings page-form-detail-card'}>
            <div className={'page-form-detail-card-header'}>
              <PageFormDetailTitle {...caption} />
            </div>
            <div className={'page-form-detail-card-body'}>
              {children}
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
)}