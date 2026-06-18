import { BaseListPage } from '../../core';


export function InventoryCategoryListPage() {

  return (
    
    <BaseListPage caption='Inventory Category List' breadcrumb={{path: '/inventory-category/Inventory Category List'}}  items={[
      {
        type: 'grid',
        caption: 'Inventory Category',
        metaListOptions: {
          editable: true,
          keyId: 'id',
          //detailPath: '/inventory/form',
          columns: [
            { dataField: 'id' },
            { dataField: 'name' },
            { dataField: 'tenantId' }
          ],
          summary: {
            groupItems: [
              {
                column: 'id',
                summaryType: 'count',
                displayFormat: 'Count: {0}'
              }
            ],
            totalItems: [
              {
                column: 'id',
                summaryType: 'count',
                displayFormat: 'Size{0}'
              }
            ]
          },
        },
        operationUrl: "https://localhost:7131/api/InvCategory"
      }
    ]} />
  );
}

