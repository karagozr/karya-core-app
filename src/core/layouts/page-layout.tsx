import React  from 'react';
import { PageBreadcrumb, PageTitle, type PageBreadcrumbProps, type PageTitleProps } from '../components';
import './page-layout.scss';
import Toolbar, { type IItemProps } from 'devextreme-react/toolbar';

export interface IPageLayoutProps {
    breadcrumb?: React.PropsWithChildren<PageBreadcrumbProps>;
    title?:React.PropsWithChildren<PageTitleProps>;
    isListPage: boolean|false;
    actionButtons? :Array<IItemProps|any>;

}


export function PageLayout({ breadcrumb, title, children, isListPage=false }
    : React.PropsWithChildren<IPageLayoutProps>) {
  
  return (
    <React.Fragment>
      <PageBreadcrumb {...breadcrumb} />
      <PageTitle {...title} />
      <div className={'content-block'}>
        <div className={isListPage ?  'dx-card responsive-list-paddings': 'dx-card responsive-paddings'}>
            {children}
        </div>
      </div>
    </React.Fragment>
)}