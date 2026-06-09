import './page-breadcrumb.scss';
import type { PageBreadcrumbProps } from './types';



export function PageBreadcrumb({ path }: React.PropsWithChildren<PageBreadcrumbProps>) {
  return (
    <p className='breadcrumb' >{path}</p>
)}
