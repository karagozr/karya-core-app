import React from 'react';
import {BaseFormPage} from '../../core/pages/form-page';

export function Profile() {

  return (
    
      <BaseFormPage key='1' items={[
        {
          type: 'form',
          caption: 'Profile',
          metaFormOptions: {
            id: 'form',
            colCount: 2,
            items: [
              {
                colSpan: 2,
                itemType: 'group',
                caption: 'Main Info',
                colCount: 1,
                items: [
                  { dataField: 'id', colSpan: 1, editorOptions:{ readOnly: true } },
                  { dataField: 'name', colSpan: 1 },
                 
                ]
              },
              {
                colSpan: 2,
                itemType: 'group',
                caption: 'Details',
                colCount: 1,
                items: [
                  { dataField: 'categoryId', colSpan: 1 },
                  { dataField: 'brand', colSpan: 1 }
                ]
              }
            ],
          },
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory"
        },
        {
          type: 'detail',
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory",
          metaFormDetailOptions:{
            caption: 'Listt',
            isEditable: true,
            columns: [
              { dataField: 'id', caption: 'ID' },
              { dataField: 'name', caption: 'Name' },
              { dataField: 'categoryId', caption: 'Category' },
              { dataField: 'brand', caption: 'Brand' }
            ]
          }
        }
      ]} />
    
  );
}

