import {BaseFormPage} from '../../core';

export function InventoryFormPage() {

  return (
      <BaseFormPage key='1' breadcrumbPath='/inventory' caption='Inventory' items={[
        {
          type: 'form',
          caption: 'Inventory',
          metaFormOptions: {
            id: 'form',
            colCount: 4,
            items: [
                { dataField: 'id', colSpan: 1, editorOptions:{ readOnly: true } },
                { dataField: 'name', colSpan: 3 },
                { dataField: 'categoryId', colSpan: 1 },
                { dataField: 'brand', colSpan: 1 }
            
                
            ],
          },
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory"
        },{
          type: 'detail',
          caption: 'Notes',
          inTab: true,
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory-detail",
          metaFormDetailOptions: {
            masterId: 'id',
            isEditable: true,
            parentKeyField: 'inventoryId',
            columns: [
              { dataField: 'id', editorOptions:{ readOnly: true } },
              { dataField: 'inventoryId' },
              { dataField: 'note' },
              { dataField: 'noteDate' }
            ]
          }
        }
      ]} />
    
  );
}

