import { BaseListPage } from '../../core';


export function InventoryMainCategoryListPage() {

  return (
    
    <BaseListPage caption='Inventory Main Category List' pageRate='half' breadcrumb={{path: '/inventory-main-category/Inventory Main Category List'}}  items={[
      {
        type: 'grid',
        caption: 'Inventory Main Category',
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
        operationUrl: "https://localhost:7131/api/InvMainCategory"
      }
    ]} />
  );
}

