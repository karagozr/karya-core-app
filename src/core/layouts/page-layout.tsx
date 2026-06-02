import React  from 'react';
import { PageBreadcrumb, PageTitle, type PageBreadcrumbProps, type PageTitleProps } from '../components';
import './page-layout.scss';

export interface IPageLayoutProps {
    breadcrumb?: React.PropsWithChildren<PageBreadcrumbProps>;
    title?:React.PropsWithChildren<PageTitleProps>;
}


export function PageLayout({ breadcrumb, title, children }
    : React.PropsWithChildren<IPageLayoutProps>) {
  
  return (
    <React.Fragment>
      <PageBreadcrumb {...breadcrumb} />
      <PageTitle {...title} />
      <div className={'content-block'}>
    
         {children}
      </div>
    </React.Fragment>
)}