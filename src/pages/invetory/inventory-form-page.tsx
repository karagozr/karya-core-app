import {BaseFormPage} from '../../core';

export function InventoryFormPage() {

  return (
      <BaseFormPage key='1' breadcrumbPath='/inventory' caption='Inventory' formOptions={{
          id: 'form',
            colCount: 4,
            items: [
                { dataField: 'id', colSpan: 1, editorOptions:{ readOnly: true } },
                { dataField: 'name', colSpan: 3 },
                { dataField: 'categoryId', colSpan: 1 },
                { dataField: 'brand', colSpan: 1 }
            ],
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory",
          customToolbarItems: [
            {
              location: 'after',
              widget: 'dxButton',
              options: {
                icon: 'bell',
                text: 'Öttür',
                onClick: (e:any) => console.log('Custom action clicked', e)
              }
             }
          ]
        }} detailItems={[
        {
          type: 'detail',
          title: 'Notes',
          inTab: false,
          formDetailOptions: {
            operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory-detail",
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

