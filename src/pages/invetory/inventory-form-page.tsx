import {BaseFormPage} from '../../core';

export function InventoryFormPage() {

  return (
      <BaseFormPage key='1' items={[
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
        }
      ]} />
    
  );
}

