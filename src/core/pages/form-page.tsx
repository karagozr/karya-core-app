import { Form } from "devextreme-react";
import React from "react";
import { AppForm } from "../components";
import type { IFormMetaItemList } from "../interfaces";
import { AppFormContext, useAppFormContext } from "../contexts";


const colCountByScreenOfDetail = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
};




export default function BaseFormPage({ items }: React.PropsWithChildren<IFormMetaItemList>) {
  
    var appFormContext = useAppFormContext();
    
  return (
    <AppFormContext.Provider value={appFormContext}>
     <React.Fragment>
      {items && items.map((item, index) => (
        <AppForm key={index} {...item} />
      ))}
    </React.Fragment>
    </AppFormContext.Provider>
  );
}
    


 {/* <h2>Profile</h2>

      <div className={'content-block dx-card responsive-paddings'}>
        <div className={'form-avatar'}>
          <img
            alt={''}
            src={`https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/${
              employee.Picture
            }`}
          />
        </div>
        <span>{notes}</span>
      </div>

      <div className={'content-block dx-card responsive-paddings'}>
        <Form
          id={'form'}
          defaultFormData={employee}
          onFieldDataChanged={e => e.dataField === 'Notes' && setNotes(e.value)}
          labelLocation={'top'}
          colCountByScreen={colCountByScreen}
        />
      </div>*/}