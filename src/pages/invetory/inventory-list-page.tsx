import { ApiRequest, BaseListPage } from '../../core';


export function InventoryListPage() {

  const genRandomName = () => {
    const names = ['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard'];
    return names[Math.floor(Math.random() * names.length)] + '-' + Math.floor(Math.random() * 1000);
  }

  const handleCustomClick = async (e:any) => {
    await ApiRequest.Put('https://6a0efaf31736097c360af529.mockapi.io/api/inventory','1' ,{'name': genRandomName()});
    e.getDataSource().reload();
  }

  return (
    <BaseListPage caption='Inventory List' breadcrumb={{path: '/inventory/Inventory List'}}  items={[
      {
        type: 'grid',
        caption: 'Inventory',
        metaListOptions: {
          keyId: 'id',
          detailPath: '/inventory/form',
          editable: true,
          toolbarsItems: [
          {
              widget: 'dxButton',
              options: {
                icon: 'airplane',
                text: 'Transfer',
                onClick: handleCustomClick
              }
            }
          ],
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

