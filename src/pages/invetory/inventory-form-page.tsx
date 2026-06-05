import React from 'react';
import { BaseFormPage, type AppFormRef, type BaseModalRef, type IFormPageMetaItem } from '../../core';
import { InventoryDetailModal } from './inventory-detail-modal';
import { Lookup } from 'devextreme-react';
import { CustomStore, DataSource, ODataStore } from 'devextreme/common/data';


export const InventoryFormPage = () => {

  const modalRef = React.useRef<BaseModalRef>(null);
  const formRef = React.useRef<AppFormRef>(null);

  const testDs1 = new DataSource({
    store: new CustomStore({
      byKey: (key) => fetch(`https://6a0efaf31736097c360af529.mockapi.io/api/category/${key}`)
        .then(response => response.json()),
      load: (loadOptions) => {
        console.log('Loading categories with options:', loadOptions);
        var data = fetch('https://6a0efaf31736097c360af529.mockapi.io/api/category')
          .then(response => response.json())

        return data;
      }
    })

  })

  const testDs2= new DataSource({
    store: new CustomStore({
      byKey: (key) => fetch(`https://6a0efaf31736097c360af529.mockapi.io/api/category/${key}`)
        .then(response => response.json()),
      load: (loadOptions) => {
        console.log('param, loadOptions:', formRef.current?.formData,loadOptions);
        var data = fetch('https://6a0efaf31736097c360af529.mockapi.io/api/category')
          .then(response => response.json())

        return data;
      }
    })

  })



  const meta: IFormPageMetaItem = {
    caption: 'Inventory Form',
    breadcrumb: { path: '/inventory/form' },
    formOptions: {
      id: 'form',
      colCount: 4,
      ref: formRef,
      items: [
        { dataField: 'id', colSpan: 1, editorOptions: { readOnly: true } },
        { dataField: 'name', colSpan: 3, isRequired: true, validationRules: [{ type: 'required', message: 'Name is required' }] },
        { dataField: 'categoryId', colSpan: 1, editorType: 'dxLookup', editorOptions: { dataSource: testDs1, displayExpr: 'name', valueExpr: 'id' } },
        { dataField: 'brand', colSpan: 1, editorType: 'dxLookup', editorOptions: { dataSource: testDs2, displayExpr: 'name', valueExpr: 'id' } }
      ],
      operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory",
      toolbarsItems: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: "auto",
          options: {
            icon: 'bell',
            text: 'Öttür',
            onClick: (e: any) => console.log(">>>", formRef.current?.getFormData()) //modalRef.current?.open(e)
          }
        }
      ]
    },
    detailCaption: 'Inventory Details',
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
                text: 'Zil',
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
      <InventoryDetailModal id='zzzzzz' modalRef={modalRef} />
      <BaseFormPage key='1' {...meta} />
    </React.Fragment>
  );

}






