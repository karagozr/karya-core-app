import React from 'react';
import { BaseFormPage, BaseModal, type BaseModalRef, type IFormPageMetaItem } from '../../core';


export const InventoryFormPage = () => {
  
  const modalRef = React.useRef<BaseModalRef>(null);

  const meta: IFormPageMetaItem = {
    caption: 'Inventory Form',
    breadcrumb: { path: '/inventory/form' },
    formOptions: {
      id: 'form',
      colCount: 4,
      items: [
        { dataField: 'id', colSpan: 1, editorOptions: { readOnly: true } },
        { dataField: 'name', colSpan: 3, isRequired: true, validationRules: [{ type: 'required', message: 'Name is required' }] },
        { dataField: 'categoryId', colSpan: 1 },
        { dataField: 'brand', colSpan: 1 }
      ],
      operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory",
      toolbarsItems: [
        {
          location: 'after',
          widget: 'dxButton',
          options: {
            icon: 'bell',
            text: 'Öttür',
            onClick: (e: any) => modalRef.current?.open(e)
          }
        }
      ]
    },
    detailItems: [
      {
        type: 'detail',
        title: 'Notes',
        inTab: true,
        formDetailOptions: {
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory-detail",
          isEditable: true,
          parentKeyField: 'inventoryId',
          columns: [
            { dataField: 'id', editorOptions: { readOnly: true } },
            { dataField: 'inventoryId' },
            { dataField: 'note', validationRules: [{ type: 'required', message: 'Note is required' }] },
            { dataField: 'noteDate' }
          ],
          toolbarsItems: [
            {
              widget: 'dxButton',
              options: {
                icon: 'bell',
                text: 'Öttür',
                onClick: (e: any) => console.log('Custom action clicked', e)
              }
            }
          ]
        }
      }
    ]
  };

  return (
    <React.Fragment>
      <BaseModal ref={modalRef} title="Custom Modal" />
      <BaseFormPage key='1' {...meta} />
    </React.Fragment>
  );

}






