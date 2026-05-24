import { BaseListPage } from '../../core';

export function InventoryListPage() {

  return (
    <BaseListPage caption='Inventory List' breadcrumbPath='/inventory/Inventory List'  items={[
      {
        type: 'grid',
        caption: 'Inventory',

        metaListOptions: {
          keyId: 'id',
          detailPath: '/inventory/form',
          editable: true,
          columns: [
            { dataField: 'id', editorOptions: { readOnly: true } },
            { dataField: 'name' },
            { dataField: 'categoryId' },
            { dataField: 'brand' }
          ],
        },
        operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory"
      }
    ]} />

  );
}

