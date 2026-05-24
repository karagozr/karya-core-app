import './page-breadcrumb.scss';

export interface PageBreadcrumbProps {
    path?: string;
}


export function PageBreadcrumb({ path }: React.PropsWithChildren<PageBreadcrumbProps>) {
  return (
    <p className='breadcrumb' >{path}</p>
)}
