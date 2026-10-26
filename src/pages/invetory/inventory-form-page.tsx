import React from 'react';
import { BaseFormPage, useAppModalContext, useProvideAppModalContext, type AppFormRef, type BaseModalRef, type IAppFormProps } from '../../core';
import { InventoryDetailModal } from './inventory-detail-modal';
import type { IBaseFormPageProps } from '../../core/pages/types/form-page';


export const InventoryFormPage = () => {
  const formRef = React.useRef<AppFormRef>(null);
  const meta: IBaseFormPageProps = {
    caption: 'Inventory Form',
    breadcrumb: { path: '/inventory/form' },
    formOptions: {
      ref: formRef,
      id: 'form',
      colCount: 8,
      items: [
        { dataField: 'id', colSpan: 1, validationRules: [{ type: 'required', message: 'Name is required' }] },
        { dataField: 'name', colSpan: 3, isRequired: true, validationRules: [{ type: 'required', message: 'Name is required' }] },
        {
          dataField: 'mainCategoryId', colSpan: 1, editorType: 'dxLookup',
          editorOptions: {
            displayExpr: 'name', valueExpr: 'id',
            dsUrl: 'https://localhost:7131/api/InvMainCategory',
            dsCascadeChildrens: ['categoryId'],
          }
        },
        {
          dataField: 'categoryId', colSpan: 1, editorType: 'dxLookup',
          editorOptions: {
            displayExpr: 'name', valueExpr: 'id',
            dsUrl: 'https://localhost:7131/api/InvCategory',
            dsCascadeParents: ['mainCategoryId']
          }
        },
        { dataField: 'brand', colSpan: 1 },

      ],
      operationUrl: "https://localhost:7131/api/Inv",
      toolbarItems: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: "auto",
          options: {
            icon: 'bell',
            text: 'Öttür',
            onClick: (e: any) => formRef.current?.openModal('inventoryDetailModal')
          }
        }
      ]
    },
    detailCaption: 'Inventory Details',
    detailItems: [
      {
        modal: {
          modalKey: 'inventoryDetailModal',
          title: 'Inventory Detail Modal',
          width: 800,
          height: 600,
          showCloseButton: true,
        },
        type: 'detail',
        title: 'Notes',
        inTab: false,
        formDetailOptions: {
          masterDetailEnabled: false,
          operationUrl: "https://localhost:7131/api/invdetail",
          isEditable: true,
          parentFields: ["inventoryId"],
          columns: [
            { dataField: 'id', editorOptions: { readOnly: true } },
            { dataField: 'note', validationRules: [{ type: 'required', message: 'Note is required' }] },
            {
              dataField: 'mainCategoryId',
              calculateDisplayValue: (item: any) => item?.mainCategoryId ? (item?.mainCategoryId + ' - ' + item?.mainCategoryName) :'',
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item?.id ? item?.id + ' - ' + item?.name : '',

              },
              dsUrl: 'https://localhost:7131/api/InvMainCategory',
              dsCascadeChildrens: ['categoryId'],
              dsSearchFields: ['id', 'name'],
            },
            {
              dataField: 'categoryId',
              calculateDisplayValue: (item: any) =>  item?.categoryId ? (item?.categoryId + ' - ' + item?.categoryName) :'',
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item?.id ? item?.id + ' - ' + item?.name : '',

              },
              dsUrl: 'https://localhost:7131/api/InvCategory',
              dsCascadeParents: ['mainCategoryId'],
              dsSearchFields: ['id', 'name'],
            },
          ],
        }
      }
    ]
  }

  return (
    <BaseFormPage key='1' {...meta}/>
  );

}




