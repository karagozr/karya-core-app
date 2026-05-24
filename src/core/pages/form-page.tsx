import React from "react";
import { AppForm } from "../components/form";
import type { IFormMetaItemList } from "../interfaces";
import { AppFormContext, useAppFormContext } from "../contexts";




export function BaseFormPage({ items }: React.PropsWithChildren<IFormMetaItemList>) {
  
  const appFormContext = useAppFormContext();
 
   
  return (
    <AppFormContext.Provider value={appFormContext}>
      <React.Fragment>
        {
          items?.filter(item => !item.inTab).map((item: any, index: number) => {
            switch (item.type) {
              case 'form':
                return <AppForm key={index} {...item} />
              // case 'detail':
              //   return <AppFormDetail key={index} {...item} />
              default:
                return null;
            }
          })
        }
      </React.Fragment>
    </AppFormContext.Provider>
  );
}
    

