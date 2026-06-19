import { BaseListPage } from '../../core';

export function InventoryListPage() {
  console.log('BaseListPage items', new Date().toISOString());
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
            { dataField: 'categoryId', 
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item?.id + ' - ' + item?.name,
                
              },
              dsUrl: 'https://localhost:7131/api/InvCategory',
              dsCascadeChildrens: ['brand']  
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

