import { BaseListPage } from '../../core';


export function InventoryCategoryListPage() {

  return (
    
    <BaseListPage caption='Inventory Category List' pageRate='half' breadcrumb={{path: '/inventory-category/Inventory Category List'}}  items={[
      {
        type: 'grid',
        caption: 'Inventory Category',
        metaListOptions: {
          editable: true,
          keyId: 'id',
          //detailPath: '/inventory/form',
          columns: [
            { dataField: 'id' },
            { dataField: 'name' }
          ],
          summary: {
            totalItems: [
              {
                column: 'id',
                summaryType: 'count',
                displayFormat: '{0} Ad.'
              }
            ]
          },
        },
        operationUrl: "https://localhost:7131/api/InvCategory"
      }
    ]} />
  );
}

