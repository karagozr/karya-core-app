import './page-title.scss';

export interface PageTitleProps {
    title?: string;
}


export function PageTitle({ title }: React.PropsWithChildren<PageTitleProps>) {
  return (
     <h4 className={'app-page-title'} >{title}</h4>
)}
