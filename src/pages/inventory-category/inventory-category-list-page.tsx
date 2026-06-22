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
            { dataField: 'name' },
            { dataField: 'mainCategoryId',
              calculateDisplayValue: (item: any) => item.mainCategoryId ? (item?.mainCategoryId + ' - ' + item?.mainCategoryName) :'',
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item.id ? item?.id + ' - ' + item?.name : '',
              },
              dsUrl: 'https://localhost:7131/api/InvMainCategory',
            },
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

