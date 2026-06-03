import { BaseCustomPage, type IBasePageMetaItem } from '../../core';


export const InventoryReportPage = () => <BaseCustomPage key='1' {...meta} >
  <h1>Inventory Report</h1>
  <p>This is the inventory report page. You can add your report components here.</p>
</BaseCustomPage>

const meta: IBasePageMetaItem = {
  caption: 'Inventory Report',
  breadcrumb: { path: '/inventory/report' }
};




 