import './page-title.scss';

export interface PageFormDetailTitleProps {
    title?: string;
}


export function PageFormDetailTitle({ title }: React.PropsWithChildren<PageFormDetailTitleProps>) {
  return (
     <div className={'form-detail-title'} >
        <h5 className='form-detail-title-text'>{title}</h5>
     </div>
)}
