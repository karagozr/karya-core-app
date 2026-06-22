import { BaseListPage } from '../../core';

export function InventoryListPage() {
  return (
    <BaseListPage pageRate='full' caption='Inventory List' breadcrumb={{path: '>inventory/Inventory List'}}  items={[
      {
        type: 'grid',
        caption: 'Inventory',
        metaListOptions: {
          keyId: 'id',
          //detailPath: '/inventory/form',
          editable: true,
          
          columns: [
            { dataField: 'id'},
            { dataField: 'name' },
            { dataField: 'brand' },
            { dataField: 'mainCategoryId', 
              calculateDisplayValue: (item: any) => item?.mainCategoryId ? (item?.mainCategoryId + ' - ' + item?.mainCategoryName) :'',
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item?.id ? item?.id + ' - ' + item?.name : '',
                
              },
              dsUrl: 'https://localhost:7131/api/InvMainCategory',
              dsCascadeChildrens: ['categoryId'],
              dsSearchFields: ['id', 'name'],
            },
            { dataField: 'categoryId', 
              calculateDisplayValue: (item: any) => item?.categoryId ? (item?.categoryId + ' - ' + item?.categoryName) :'',
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item?.id ? item?.id + ' - ' + item?.name : '',
                
              },
              dsUrl: 'https://localhost:7131/api/InvCategory',
              dsCascadeParents: ['mainCategoryId'],
              dsSearchFields: ['id', 'name'],
            },
            
            
          ],
          summary:{
            totalItems: [
              {
                column: 'id',
                summaryType: 'count',
                displayFormat: '{0} Ad.'
              },
              {
                column: 'name',
                summaryType: 'count',
                displayFormat: '{0} Marka'
              }
            ]
          }
        },
        operationUrl: "https://localhost:7131/api/Inv"
      }
    ]} />
  );
}

